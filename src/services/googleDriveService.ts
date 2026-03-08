/**
 * Google Drive Service — OAuth + file upload + sync via Drive REST API v3.
 */

import { Preferences } from '@capacitor/preferences';
import { getDb } from '@/db/database';
import * as settingsService from './settingsService';
import * as fileSystemService from './fileSystemService';
import type { GoogleAccount } from '@/types';

const ACCOUNTS_KEY = 'gdrive_accounts';

// ─── Account Management ────────────────────────────────────

export async function getAccounts(): Promise<GoogleAccount[]> {
  const { value } = await Preferences.get({ key: ACCOUNTS_KEY });
  if (!value) return [];
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

async function saveAccounts(accounts: GoogleAccount[]): Promise<void> {
  await Preferences.set({ key: ACCOUNTS_KEY, value: JSON.stringify(accounts) });
}

export async function connect(): Promise<GoogleAccount> {
  const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error('Google Client ID not configured');

  const redirectUri = `${window.location.origin}/oauth/callback`;
  const scope = 'openid email https://www.googleapis.com/auth/drive.file';

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scope)}` +
    `&access_type=offline` +
    `&prompt=consent`;

  // Open popup
  const popup = window.open(authUrl, 'google-auth', 'width=500,height=600');
  if (!popup) throw new Error('Failed to open auth popup');

  // Wait for callback
  const code = await new Promise<string>((resolve, reject) => {
    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        reject(new Error('Auth popup closed'));
      }
    }, 500);

    window.addEventListener('message', function handler(event) {
      if (event.data?.type === 'google-auth-code') {
        clearInterval(timer);
        window.removeEventListener('message', handler);
        resolve(event.data.code);
      }
    });
  });

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenRes.ok) throw new Error('Failed to exchange auth code');
  const tokens = await tokenRes.json();

  // Get user info
  const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const userInfo = await userRes.json();

  // Store tokens
  await Preferences.set({
    key: `gdrive_token_${userInfo.email}`,
    value: JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + (tokens.expires_in * 1000),
    }),
  });

  // Add to accounts
  const accounts = await getAccounts();
  const existing = accounts.find(a => a.email === userInfo.email);
  if (existing) {
    existing.active = true;
  } else {
    accounts.forEach(a => (a.active = false));
    accounts.push({ id: userInfo.id, email: userInfo.email, active: true });
  }
  await saveAccounts(accounts);

  return { id: userInfo.id, email: userInfo.email, active: true };
}

export async function disconnect(email: string): Promise<void> {
  const { value } = await Preferences.get({ key: `gdrive_token_${email}` });
  if (value) {
    try {
      const tokens = JSON.parse(value);
      await fetch(`https://oauth2.googleapis.com/revoke?token=${tokens.access_token}`, { method: 'POST' });
    } catch {
      // Revocation is best-effort
    }
  }

  await Preferences.remove({ key: `gdrive_token_${email}` });

  const accounts = (await getAccounts()).filter(a => a.email !== email);
  await saveAccounts(accounts);
}

export async function setActiveAccount(email: string): Promise<void> {
  const accounts = await getAccounts();
  accounts.forEach(a => (a.active = a.email === email));
  await saveAccounts(accounts);
}

// ─── Token Management ──────────────────────────────────────

async function getValidToken(): Promise<{ accessToken: string; email: string }> {
  const accounts = await getAccounts();
  const active = accounts.find(a => a.active);
  if (!active) throw new Error('NO_GOOGLE_ACCOUNT');

  const { value } = await Preferences.get({ key: `gdrive_token_${active.email}` });
  if (!value) throw new Error('NO_GOOGLE_ACCOUNT');

  const tokens = JSON.parse(value);

  // Refresh if expired
  if (Date.now() >= tokens.expires_at - 60000) {
    const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: tokens.refresh_token,
        client_id: clientId,
        grant_type: 'refresh_token',
      }),
    });

    if (!res.ok) throw new Error('TOKEN_REFRESH_FAILED');
    const refreshed = await res.json();
    tokens.access_token = refreshed.access_token;
    tokens.expires_at = Date.now() + (refreshed.expires_in * 1000);

    await Preferences.set({
      key: `gdrive_token_${active.email}`,
      value: JSON.stringify(tokens),
    });
  }

  return { accessToken: tokens.access_token, email: active.email };
}

// ─── Drive Operations ──────────────────────────────────────

async function ensureMedoraFolder(accessToken: string): Promise<string> {
  // Check if folder exists
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent("name='Medora' and mimeType='application/vnd.google-apps.folder' and trashed=false")}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const searchData = await searchRes.json();

  if (searchData.files?.length > 0) {
    return searchData.files[0].id;
  }

  // Create folder
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Medora',
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });
  const folder = await createRes.json();
  return folder.id;
}

export async function uploadFile(options: {
  fileName: string;
  base64Data: string;
  mimeType: string;
}): Promise<string> {
  const { accessToken } = await getValidToken();
  const folderId = await ensureMedoraFolder(accessToken);

  const metadata = JSON.stringify({
    name: options.fileName,
    parents: [folderId],
  });

  // Decode base64
  const binaryString = atob(options.base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const boundary = '-----medora_boundary_' + Date.now();
  const body =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${metadata}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: ${options.mimeType}\r\n` +
    `Content-Transfer-Encoding: base64\r\n\r\n` +
    `${options.base64Data}\r\n` +
    `--${boundary}--`;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  });

  if (!res.ok) throw new Error('DRIVE_UPLOAD_FAILED');
  const result = await res.json();
  return result.id;
}

// ─── Sync ──────────────────────────────────────────────────

export async function sync(onProgress: (percent: number, message: string) => void): Promise<void> {
  onProgress(10, 'Connecting to Google Drive...');
  const { accessToken } = await getValidToken();

  onProgress(30, 'Checking for changes...');
  const db = getDb();
  const queueRes = await db.query(
    `SELECT * FROM sync_queue WHERE status = 'pending' ORDER BY created_at ASC`
  );
  const pendingItems = queueRes.values ?? [];

  onProgress(50, 'Syncing records...');
  for (const item of pendingItems) {
    try {
      const payload = item.payload ? JSON.parse(item.payload) : { table: item.table_name, id: item.record_id, op: item.operation };
      const fileName = `sync_${item.table_name}_${item.record_id}_${Date.now()}.json`;
      const base64Data = btoa(JSON.stringify(payload));

      await uploadFile({ fileName, base64Data, mimeType: 'application/json' });
      await db.run(`UPDATE sync_queue SET status = 'completed' WHERE id = ?`, [item.id]);
    } catch {
      await db.run(`UPDATE sync_queue SET retry_count = retry_count + 1 WHERE id = ?`, [item.id]);
    }
  }

  onProgress(75, 'Syncing images...');
  // Upload unsynced media
  const mediaRes = await db.query(
    `SELECT * FROM media WHERE sync_status = 'pending' AND is_deleted = 0`
  );
  for (const media of mediaRes.values ?? []) {
    try {
      const base64 = await fileSystemService.readFile(media.file_path);
      await uploadFile({ fileName: media.file_path, base64Data: base64, mimeType: 'image/jpeg' });
      await db.run(`UPDATE media SET sync_status = 'synced' WHERE id = ?`, [media.id]);
    } catch {
      // Skip failed uploads
    }
  }

  onProgress(90, 'Verifying...');
  await settingsService.set('last_synced_at', new Date().toISOString());

  onProgress(100, 'Complete');
}
