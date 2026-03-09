import React, { useState, useEffect } from 'react';
import SettingsExportSheet from '@/components/SettingsExportSheet';
import CreateBackupSheet from '@/components/CreateBackupSheet';
import AboutSheet from '@/components/AboutSheet';
import ThemeColorSheet from '@/components/ThemeColorSheet';
import FontSizeSheet from '@/components/FontSizeSheet';
import DateFormatSheet from '@/components/DateFormatSheet';
import ManageHospitalsSheet from '@/components/ManageHospitalsSheet';
import DefaultHospitalSheet from '@/components/DefaultHospitalSheet';
import AIProviderSheet from '@/components/AIProviderSheet';
import APIKeySheet from '@/components/APIKeySheet';
import AIModelSheet from '@/components/AIModelSheet';
import AILanguageSheet from '@/components/AILanguageSheet';
import SyncFrequencySheet from '@/components/SyncFrequencySheet';
import GoogleAccountSheet from '@/components/GoogleAccountSheet';
import ProgressSheet, { OperationType } from '@/components/ProgressSheet';
import SyncProgressSheet from '@/components/SyncProgressSheet';
import RestoreBackupSheet from '@/components/RestoreBackupSheet';
import ImageHandlingSheet from '@/components/ImageHandlingSheet';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Palette, Moon, Type, Globe, CalendarDays,
  Building2, Home, Bot, KeyRound, Brain, Languages, Zap,
  RefreshCw, Lock, UserCircle, Clock,
  Database, HardDrive, Cloud, Download, Upload,
  Shield, FileText, HardDriveDownload, Image, ToggleLeft,
  MessageSquare, Save, Eye, Trash2, Info
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Hooks
import { useSettings, useUpdateSetting, useUpdateSettings } from '@/hooks/useSettings';
import { useHospitals, useCreateHospital, useUpdateHospital, useDeleteHospital } from '@/hooks/useHospitals';
import { useGoogleAccounts, useConnectGoogle, useDisconnectGoogle, useSetActiveAccount, useSyncNow } from '@/hooks/useGoogleDrive';
import { useLastBackupInfo, useCreateBackup, useRestoreBackup } from '@/hooks/useBackup';
import { useExportData } from '@/hooks/useExport';
import { useStorageSize } from '@/hooks/useStorage';
import { formatSize } from '@/services/storageService';

/* ── helpers ── */
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <h3 className="text-[12px] font-bold uppercase tracking-wider px-1" style={{ color: '#6B7C93' }}>{title}</h3>
    <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', boxShadow: '0px 1px 4px rgba(0,0,0,0.06)' }}>
      {children}
    </div>
  </div>
);

const Row = ({
  icon: Icon, iconColor, label, subtitle, lastBackup, right, onClick, noBorder,
}: {
  icon: any; iconColor?: string; label: string; subtitle?: string;
  lastBackup?: { date: string; size: string } | null;
  right?: React.ReactNode; onClick?: () => void; noBorder?: boolean;
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 text-left transition-colors hover:bg-muted/40"
    style={{ minHeight: 56, padding: '12px 16px', borderBottom: noBorder ? 'none' : '1px solid #F0F4F8' }}
  >
    <Icon size={20} style={{ color: iconColor || 'hsl(213,78%,48%)' }} className="flex-shrink-0 mt-0.5" />
    <div className="flex-1 min-w-0">
      <div className="text-[15px] font-medium truncate" style={{ color: '#1A2332' }}>{label}</div>
      {subtitle && <div className="text-[12px] truncate" style={{ color: '#6B7C93' }}>{subtitle}</div>}
      {lastBackup !== undefined && (
        lastBackup ? (
          <div className="text-[11px]" style={{ color: '#94A3B8' }}>
            <span className="font-bold" style={{ color: '#6B7C93' }}>Last:</span> {lastBackup.date} · {lastBackup.size}
          </div>
        ) : (
          <div className="text-[11px] font-medium" style={{ color: '#EF4444' }}>Never backed up</div>
        )
      )}
    </div>
    {right}
  </button>
);

const Chevron = () => <span className="text-[16px]" style={{ color: '#6B7C93' }}>›</span>;

const SettingsScreen = () => {
  const navigate = useNavigate();

  // ─── Real data hooks ───────────────────────────────────────
  const { data: settings } = useSettings();
  const { mutate: updateSetting } = useUpdateSetting();
  const { mutate: updateSettings } = useUpdateSettings();

  const { data: hospitals = [] } = useHospitals();

  const { data: googleAccounts = [] } = useGoogleAccounts();
  const { mutate: connectGoogle } = useConnectGoogle();
  const { mutate: disconnectGoogle } = useDisconnectGoogle();
  const { mutate: setActiveAccount } = useSetActiveAccount();
  const { start: startSync } = useSyncNow();

  const { data: lastBackupData } = useLastBackupInfo();
  const { start: startBackup } = useCreateBackup();
  const { start: startRestore } = useRestoreBackup();
  const { start: startExport } = useExportData();

  const { data: storageBytes } = useStorageSize();

  // ─── Sheet open/close state ────────────────────────────────
  const [aiProviderOpen, setAiProviderOpen] = useState(false);
  const [apiKeyOpen, setApiKeyOpen] = useState(false);
  const [aiModelOpen, setAiModelOpen] = useState(false);
  const [aiLanguageOpen, setAiLanguageOpen] = useState(false);
  const [syncFreqOpen, setSyncFreqOpen] = useState(false);
  const [googleAccountOpen, setGoogleAccountOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [progressType, setProgressType] = useState<OperationType>('backup');
  const [progressDetail, setProgressDetail] = useState('');
  const [syncProgressOpen, setSyncProgressOpen] = useState(false);
  const [restoreSheetOpen, setRestoreSheetOpen] = useState(false);
  const [imageHandlingOpen, setImageHandlingOpen] = useState(false);
  const [backupSheetOpen, setBackupSheetOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [themeSheetOpen, setThemeSheetOpen] = useState(false);
  const [fontSheetOpen, setFontSheetOpen] = useState(false);
  const [dateSheetOpen, setDateSheetOpen] = useState(false);
  const [hospitalsSheetOpen, setHospitalsSheetOpen] = useState(false);
  const [defaultHospitalSheetOpen, setDefaultHospitalSheetOpen] = useState(false);

  // ─── Derived values from settings ─────────────────────────
  const themeColor = (settings?.themeColor as string) || 'blue';
  const darkMode = (settings?.darkMode as boolean) ?? false;
  const fontSize = (settings?.fontSize as string) || 'medium';
  const dateFormat = (settings?.dateFormat as string) || 'DD MMM YYYY';
  const defaultHospitalId = (settings?.defaultHospitalId as string) || '';
  const aiProvider = (settings?.aiProvider as string) || 'anthropic';
  const apiKey = (settings?.apiKey as string) || '';
  const aiModel = (settings?.aiModel as string) || 'sonnet';
  const aiLanguage = (settings?.aiLanguage as string) || 'english';
  const aiFeatures = (settings?.aiFeatures as boolean) ?? true;
  const syncEnabled = (settings?.syncEnabled as boolean) ?? false;
  const syncFrequency = (settings?.syncFrequency as string) || 'daily';
  const encryptedBackup = (settings?.encryptedBackup as boolean) ?? true;
  const pinLock = (settings?.pinLock as boolean) ?? false;
  const biometric = (settings?.biometric as boolean) ?? false;
  const confirmDialogs = (settings?.confirmDialogs as boolean) ?? true;
  const autoSave = (settings?.autoSave as boolean) ?? true;
  const imageQuality = (settings?.imageQuality as string) || 'original';
  const imageMaxSize = (settings?.imageMaxSize as string) || '5';
  const lastSyncedText = (settings as any)?.last_synced_at || 'Never';

  const defaultHospitalName = hospitals.find((h: any) => h.id === defaultHospitalId)?.name || 'None';
  const activeAccount = googleAccounts.find((a: any) => a.active);

  // Storage display
  const storageUsedMB = storageBytes ? storageBytes / (1024 * 1024) : 0;
  const storageLabel = storageBytes ? formatSize(storageBytes) : '0 MB';
  const storagePercent = Math.min((storageUsedMB / 500) * 100, 100);

  // Last backup display
  const lastBackupInfo = lastBackupData
    ? { date: lastBackupData.date || '', size: lastBackupData.size || '', destination: (lastBackupData.destination as 'local' | 'gdrive') || 'local' }
    : null;

  const startProgress = (type: OperationType, detail?: string) => {
    setProgressType(type);
    setProgressDetail(detail || '');
    setProgressOpen(true);
  };

  const sw = (checked: boolean, onChange: (v: boolean) => void) => (
    <Switch checked={checked} onCheckedChange={onChange} />
  );

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Sub-header */}
      <header className="sticky top-0 z-50 px-4 py-3 flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-muted text-muted-foreground">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-[16px] font-bold text-foreground">Settings</h1>
      </header>

      <div className="px-5 py-5 space-y-6 pb-28">

        {/* ─── 1. APP APPEARANCE ─── */}
        <Section title="App Appearance">
          <Row icon={Palette} label="Theme Color" subtitle={themeColor === 'blue' ? 'Medical Blue (Default)' : themeColor === 'green' ? 'Forest Green' : themeColor === 'purple' ? 'Warm Purple' : 'Teal'} right={<Chevron />} onClick={() => setThemeSheetOpen(true)} />
          <Row icon={Moon} label="Dark Mode" subtitle="Easier on eyes at night" right={sw(darkMode, (v) => updateSetting({ key: 'darkMode', value: String(v) }))} />
          <Row icon={Type} label="Font Size" subtitle={fontSize === 'small' ? 'Small' : fontSize === 'medium' ? 'Medium' : 'Large'} right={<Chevron />} onClick={() => setFontSheetOpen(true)} />
          <Row icon={CalendarDays} label="Date & Time Format" subtitle={dateFormat} right={<Chevron />} onClick={() => setDateSheetOpen(true)} noBorder />
        </Section>

        {/* ─── 2. HOSPITAL MANAGEMENT ─── */}
        <Section title="Hospital Management">
          <Row icon={Building2} iconColor="#0EA5E9" label="Manage Hospitals" subtitle="Add, edit or remove" right={<Chevron />} onClick={() => setHospitalsSheetOpen(true)} />
          <Row icon={Home} iconColor="#0EA5E9" label="Default Hospital" subtitle={defaultHospitalName} right={<Chevron />} onClick={() => setDefaultHospitalSheetOpen(true)} noBorder />
        </Section>

        {/* ─── 3. AI INTEGRATION ─── */}
        <Section title="AI Integration">
          <Row icon={Bot} iconColor="#8B5CF6" label="AI Provider" subtitle={aiProvider === 'anthropic' ? 'Anthropic (Claude)' : aiProvider === 'openai' ? 'OpenAI (GPT)' : 'Other / Custom'} right={<Chevron />} onClick={() => setAiProviderOpen(true)} />
          <Row icon={KeyRound} iconColor="#8B5CF6" label="API Key" subtitle={apiKey ? apiKey.slice(0, 7) + '••••••••••••' : 'Not set'} right={<Chevron />} onClick={() => setApiKeyOpen(true)} />
          <Row icon={Brain} iconColor="#8B5CF6" label="AI Model" subtitle={aiModel === 'sonnet' ? 'Claude Sonnet' : aiModel === 'opus' ? 'Claude Opus' : 'Claude Haiku'} right={<Chevron />} onClick={() => setAiModelOpen(true)} />
          <Row icon={Languages} iconColor="#8B5CF6" label="AI Response Language" subtitle={aiLanguage === 'arabic' ? 'Arabic' : 'English'} right={<Chevron />} onClick={() => setAiLanguageOpen(true)} />
          <Row icon={Zap} iconColor="#8B5CF6" label="AI Features" subtitle="Insights, CasePearl, GroupPearl" right={sw(aiFeatures, (v) => updateSetting({ key: 'aiFeatures', value: String(v) }))} noBorder />
        </Section>

        {/* ─── 4. GOOGLE DRIVE SYNC ─── */}
        <Section title="Google Drive Sync">
          <Row icon={Cloud} iconColor="#22C55E" label="Sync Enabled" subtitle={activeAccount?.email || 'No account'} right={sw(syncEnabled, (v) => updateSetting({ key: 'syncEnabled', value: String(v) }))} />
          <Row icon={RefreshCw} iconColor="#22C55E" label="Sync Frequency" subtitle={syncFrequency === 'hourly' ? 'Every hour' : syncFrequency === '6hours' ? 'Every 6 hours' : syncFrequency === 'daily' ? 'Daily' : syncFrequency === 'weekly' ? 'Weekly' : 'Manual only'} right={<Chevron />} onClick={() => setSyncFreqOpen(true)} />
          <Row icon={Lock} iconColor="#22C55E" label="Encrypted Backup" subtitle="AES-256 encryption" right={sw(encryptedBackup, (v) => updateSetting({ key: 'encryptedBackup', value: String(v) }))} />
          <Row icon={UserCircle} iconColor="#22C55E" label="Change Google Account" right={<Chevron />} onClick={() => setGoogleAccountOpen(true)} />
          <Row icon={Clock} iconColor="#22C55E" label="Last Synced" subtitle={lastSyncedText}
            right={
              <button
                onClick={(e) => { e.stopPropagation(); setSyncProgressOpen(true); startSync(); }}
                className="text-[12px] font-bold rounded-lg px-3 py-1.5"
                style={{ background: 'hsl(213,78%,95%)', color: 'hsl(213,78%,48%)' }}
              >
                Sync Now
              </button>
            }
            noBorder
          />
        </Section>


        {/* ─── STORAGE & EXPORTING ─── */}
        <Section title="Storage & Exporting">
          <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid #F0F4F8' }}>
            <HardDriveDownload size={20} className="text-primary flex-shrink-0" />
            <div className="flex-1">
              <div className="text-[15px] font-medium" style={{ color: '#1A2332' }}>Storage Used</div>
              <div className="text-[12px] mb-1.5" style={{ color: '#6B7C93' }}>{storageLabel} / ~500 MB available</div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${storagePercent}%` }} />
              </div>
            </div>
          </div>
          <Row icon={Image} label="Image Handling" subtitle={imageQuality === 'compress' ? 'Auto Compress' : 'Lazy Load'} right={<Chevron />} onClick={() => setImageHandlingOpen(true)} />
          {/* Last Backup */}
          <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid #F0F4F8' }}>
            <Clock size={20} className="text-primary flex-shrink-0" />
            <div className="flex-1">
              <div className="text-[15px] font-medium" style={{ color: '#1A2332' }}>Last Backup</div>
              {lastBackupInfo ? (
                <>
                  <div className="text-[12px]" style={{ color: '#6B7C93' }}>{lastBackupInfo.date} · {lastBackupInfo.size}</div>
                  <div className="flex items-center gap-1 text-[11px]" style={{ color: '#94A3B8' }}>
                    {lastBackupInfo.destination === 'local' ? <HardDrive size={12} /> : <Cloud size={12} />}
                    {lastBackupInfo.destination === 'local' ? 'Local' : 'G-Drive'}
                  </div>
                </>
              ) : (
                <div className="text-[11px] font-medium" style={{ color: '#EF4444' }}>No backup yet</div>
              )}
            </div>
            <button
              onClick={() => setBackupSheetOpen(true)}
              className="text-[13px] font-bold rounded-[10px] px-3.5 py-1.5"
              style={{ background: '#2563EB', color: '#fff' }}
            >
              Backup Now
            </button>
          </div>
          <Row icon={Download} label="Restore from Backup" subtitle="Select a backup file" right={<Chevron />} onClick={() => setRestoreSheetOpen(true)} />
          <Row icon={Upload} label="Export Data" subtitle="Export your records" right={<Chevron />} onClick={() => setExportOpen(true)} noBorder />
        </Section>

        {/* ─── 8. BEHAVIOR ─── */}
        <Section title="Behavior">
          <Row icon={MessageSquare} label="Confirmation Dialogs" subtitle="Ask before deleting" right={sw(confirmDialogs, (v) => updateSetting({ key: 'confirmDialogs', value: String(v) }))} />
          <Row icon={Save} label="Auto-Save" subtitle="Save drafts automatically" right={sw(autoSave, (v) => updateSetting({ key: 'autoSave', value: String(v) }))} noBorder />
        </Section>

        {/* ─── 9. DELETE DATA ─── */}
        <div className="space-y-2">
          <h3 className="text-[12px] font-bold uppercase tracking-wider px-1" style={{ color: '#6B7C93' }}>Delete Data</h3>
          <div className="space-y-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full flex items-center gap-3 rounded-2xl text-left" style={{ height: 56, padding: '0 16px', background: '#FEE2E2' }}>
                  <Trash2 size={20} style={{ color: '#DC2626' }} />
                  <span className="text-[15px] font-medium" style={{ color: '#DC2626' }}>Delete All Cloud Data</span>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete All Cloud Data?</AlertDialogTitle>
                  <AlertDialogDescription>This will permanently delete all your cloud-synced data. This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => console.log('delete cloud')}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full flex items-center gap-3 rounded-2xl border text-left" style={{ height: 56, padding: '0 16px', background: '#fff', borderColor: '#FCA5A5' }}>
                  <Trash2 size={20} style={{ color: '#DC2626' }} />
                  <span className="text-[15px] font-medium" style={{ color: '#DC2626' }}>Clear All Local Data</span>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear All Local Data?</AlertDialogTitle>
                  <AlertDialogDescription>This will permanently delete all local data including patients, cases, and images. This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => console.log('clear local')}>Clear</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* ─── 10. ABOUT ─── */}
        <Section title="About">
          <button
            onClick={() => setAboutOpen(true)}
            className="w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-muted/40"
          >
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-brand">
              <span className="text-primary-foreground font-bold text-lg">M</span>
            </div>
            <div className="flex-1">
              <div className="text-[14px] font-bold" style={{ color: '#1A2332' }}>Medora</div>
              <div className="text-[11px]" style={{ color: '#6B7C93' }}>Medical Logbook</div>
            </div>
            <Chevron />
          </button>
        </Section>

        {/* Footer */}
        <p className="text-center text-[11px] pb-4" style={{ color: '#6B7C93' }}>
          Medora v1.0.0 · Built for Physicians
        </p>
      </div>

      {/* ─── Sheets ─── */}
      <SettingsExportSheet
        open={exportOpen}
        onOpenChange={setExportOpen}
        gdriveConnected={googleAccounts.length > 0}
        onExportStart={() => startProgress('export', 'File saved to Downloads')}
      />
      <CreateBackupSheet
        open={backupSheetOpen}
        onOpenChange={setBackupSheetOpen}
        defaultLocation={lastBackupInfo?.destination || 'local'}
        onBackupComplete={(destination: 'local' | 'gdrive') => {
          startBackup({ type: 'full', destination });
          startProgress('backup', destination === 'local' ? 'Local Storage' : 'Google Drive');
        }}
      />
      <AboutSheet open={aboutOpen} onOpenChange={setAboutOpen} />
      <ThemeColorSheet
        open={themeSheetOpen}
        onOpenChange={setThemeSheetOpen}
        value={themeColor}
        onApply={(v) => updateSetting({ key: 'themeColor', value: v })}
      />
      <FontSizeSheet
        open={fontSheetOpen}
        onOpenChange={setFontSheetOpen}
        value={fontSize}
        onApply={(v) => updateSetting({ key: 'fontSize', value: v })}
      />
      <DateFormatSheet
        open={dateSheetOpen}
        onOpenChange={setDateSheetOpen}
        value={dateFormat}
        onApply={(v) => updateSetting({ key: 'dateFormat', value: v })}
      />
      <ManageHospitalsSheet open={hospitalsSheetOpen} onOpenChange={setHospitalsSheetOpen} />
      <DefaultHospitalSheet
        open={defaultHospitalSheetOpen}
        onOpenChange={setDefaultHospitalSheetOpen}
        hospitals={hospitals.map((h: any) => ({ id: h.id, name: h.name, department: h.department, unit: h.unit }))}
        value={defaultHospitalId}
        onApply={(id) => updateSetting({ key: 'defaultHospitalId', value: id })}
      />
      <AIProviderSheet
        open={aiProviderOpen}
        onOpenChange={setAiProviderOpen}
        value={aiProvider}
        onApply={(v) => updateSetting({ key: 'aiProvider', value: v })}
      />
      <APIKeySheet
        open={apiKeyOpen}
        onOpenChange={setApiKeyOpen}
        value={apiKey}
        onSave={(v) => updateSetting({ key: 'apiKey', value: v })}
        onRemove={() => updateSetting({ key: 'apiKey', value: '' })}
      />
      <AIModelSheet
        open={aiModelOpen}
        onOpenChange={setAiModelOpen}
        value={aiModel}
        onApply={(v) => updateSetting({ key: 'aiModel', value: v })}
      />
      <AILanguageSheet
        open={aiLanguageOpen}
        onOpenChange={setAiLanguageOpen}
        value={aiLanguage}
        onApply={(v) => updateSetting({ key: 'aiLanguage', value: v })}
      />
      <SyncFrequencySheet
        open={syncFreqOpen}
        onOpenChange={setSyncFreqOpen}
        value={syncFrequency}
        onApply={(v) => updateSetting({ key: 'syncFrequency', value: v })}
      />
      <GoogleAccountSheet
        open={googleAccountOpen}
        onOpenChange={setGoogleAccountOpen}
        accounts={googleAccounts.map((a: any) => ({ id: a.id || a.email, email: a.email, active: a.active }))}
        onConnect={() => connectGoogle()}
        onSetActive={(id) => {
          const account = googleAccounts.find((a: any) => (a.id || a.email) === id);
          if (account) setActiveAccount(account.email);
        }}
        onDisconnectOne={(id) => {
          const account = googleAccounts.find((a: any) => (a.id || a.email) === id);
          if (account) {
            disconnectGoogle(account.email, {
              onSuccess: () => {
                if (googleAccounts.length <= 1) updateSetting({ key: 'syncEnabled', value: 'false' });
              }
            });
          }
        }}
        onDisconnectAll={() => {
          googleAccounts.forEach((a: any) => disconnectGoogle(a.email));
          updateSetting({ key: 'syncEnabled', value: 'false' });
        }}
      />
      <ProgressSheet open={progressOpen} onOpenChange={setProgressOpen} type={progressType} detail={progressDetail} />
      <SyncProgressSheet
        open={syncProgressOpen}
        onOpenChange={setSyncProgressOpen}
        email={activeAccount?.email || ''}
        onComplete={() => {}}
      />
      <RestoreBackupSheet
        open={restoreSheetOpen}
        onOpenChange={setRestoreSheetOpen}
        onRestore={() => startProgress('restore', 'All records restored')}
      />
      <ImageHandlingSheet
        open={imageHandlingOpen}
        onOpenChange={setImageHandlingOpen}
        onApply={(q, s) => {
          updateSettings({ imageQuality: q, imageMaxSize: s });
        }}
      />
    </div>
  );
};

export default SettingsScreen;
