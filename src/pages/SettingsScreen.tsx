import React, { useState } from 'react';
import SettingsExportSheet from '@/components/SettingsExportSheet';
import CreateBackupSheet from '@/components/CreateBackupSheet';
import AboutSheet from '@/components/AboutSheet';
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

  /* toggles */
  const [darkMode, setDarkMode] = useState(false);
  const [aiFeatures, setAiFeatures] = useState(true);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [encryptedBackup, setEncryptedBackup] = useState(true);
  const [pinLock, setPinLock] = useState(false);
  const [biometric, setBiometric] = useState(true);
  
  const [confirmDialogs, setConfirmDialogs] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);
  const [backupSheetOpen, setBackupSheetOpen] = useState(false);
  const [lastBackupInfo, setLastBackupInfo] = useState<{ date: string; size: string; destination: 'local' | 'gdrive' } | null>({ date: '2025-01-15 · 08:30', size: '245 MB', destination: 'local' });


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
          <Row icon={Palette} label="Theme Color" subtitle="Medical Blue (Default)" right={<Chevron />} />
          <Row icon={Moon} label="Dark Mode" subtitle="Easier on eyes at night" right={sw(darkMode, setDarkMode)} />
          <Row icon={Type} label="Font Size" subtitle="Medium" right={<Chevron />} />
          <Row icon={Globe} label="Language" subtitle="English" right={<Chevron />} />
          <Row icon={CalendarDays} label="Date & Time Format" subtitle="DD MMM YYYY" right={<Chevron />} noBorder />
        </Section>

        {/* ─── 2. HOSPITAL MANAGEMENT ─── */}
        <Section title="Hospital Management">
          <Row icon={Building2} iconColor="#0EA5E9" label="Manage Hospitals" subtitle="Add, edit or remove" right={<Chevron />} />
          <Row icon={Home} iconColor="#0EA5E9" label="Default Hospital" subtitle="Cairo University" right={<Chevron />} noBorder />
        </Section>

        {/* ─── 3. AI INTEGRATION ─── */}
        <Section title="AI Integration">
          <Row icon={Bot} iconColor="#8B5CF6" label="AI Provider" subtitle="Anthropic (Claude)" right={<Chevron />} />
          <Row icon={KeyRound} iconColor="#8B5CF6" label="API Key" subtitle="sk-ant-••••••••••••" right={<Chevron />} />
          <Row icon={Brain} iconColor="#8B5CF6" label="AI Model" subtitle="Claude Sonnet" right={<Chevron />} />
          <Row icon={Languages} iconColor="#8B5CF6" label="AI Response Language" subtitle="Arabic" right={<Chevron />} />
          <Row icon={Zap} iconColor="#8B5CF6" label="AI Features" subtitle="Insights, CasePearl, GroupPearl" right={sw(aiFeatures, setAiFeatures)} noBorder />
        </Section>

        {/* ─── 4. GOOGLE DRIVE SYNC ─── */}
        <Section title="Google Drive Sync">
          <Row icon={Cloud} iconColor="#22C55E" label="Sync Enabled" subtitle="user@gmail.com" right={sw(syncEnabled, setSyncEnabled)} />
          <Row icon={RefreshCw} iconColor="#22C55E" label="Sync Frequency" subtitle="Daily" right={<Chevron />} />
          <Row icon={Lock} iconColor="#22C55E" label="Encrypted Backup" subtitle="AES-256 encryption" right={sw(encryptedBackup, setEncryptedBackup)} />
          <Row icon={UserCircle} iconColor="#22C55E" label="Change Google Account" right={<Chevron />} />
          <Row icon={Clock} iconColor="#22C55E" label="Last Synced" subtitle="5 Mar 2025 · 06:48"
            right={
              <button
                onClick={(e) => { e.stopPropagation(); console.log('sync now'); }}
                className="text-[12px] font-bold rounded-lg px-3 py-1.5"
                style={{ background: 'hsl(213,78%,95%)', color: 'hsl(213,78%,48%)' }}
              >
                Sync Now
              </button>
            }
            noBorder
          />
        </Section>

        {/* ─── 5. BACKUP & RESTORE ─── */}
        <Section title="Backup & Restore">
          <Row icon={Download} label="Restore from Backup" subtitle="Select a backup file" right={<Chevron />} noBorder />
        </Section>

        {/* ─── STORAGE & EXPORTING ─── */}
        <Section title="Storage & Exporting">
          <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid #F0F4F8' }}>
            <HardDriveDownload size={20} className="text-primary flex-shrink-0" />
            <div className="flex-1">
              <div className="text-[15px] font-medium" style={{ color: '#1A2332' }}>Storage Used</div>
              <div className="text-[12px] mb-1.5" style={{ color: '#6B7C93' }}>142 MB / ~500 MB available</div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '28%' }} />
              </div>
            </div>
          </div>
          <Row icon={Image} label="Image Handling" subtitle="Lazy Load" right={<Chevron />} />
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
          <Row icon={Upload} label="Export Data" subtitle="Export your records" right={<Chevron />} onClick={() => setExportOpen(true)} noBorder />
        </Section>

        {/* ─── 8. BEHAVIOR ─── */}
        <Section title="Behavior">
          
          <Row icon={MessageSquare} label="Confirmation Dialogs" subtitle="Ask before deleting" right={sw(confirmDialogs, setConfirmDialogs)} />
          <Row icon={Save} label="Auto-Save" subtitle="Save drafts automatically" right={sw(autoSave, setAutoSave)} />
          <Row icon={Eye} label="Default View Mode" subtitle="Display" right={<Chevron />} noBorder />
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
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-brand">
                <span className="text-primary-foreground font-bold text-lg">P</span>
              </div>
              <div>
                <div className="text-[14px] font-bold" style={{ color: '#1A2332' }}>PediLog</div>
                <div className="text-[11px]" style={{ color: '#6B7C93' }}>Medical Logbook</div>
              </div>
            </div>
            <div className="space-y-1 pt-2" style={{ borderTop: '1px solid #F0F4F8' }}>
              <div className="flex justify-between text-[11px]">
                <span style={{ color: '#6B7C93' }}>App Version</span>
                <span className="font-medium" style={{ color: '#1A2332' }}>2.1.0</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span style={{ color: '#6B7C93' }}>Schema Version</span>
                <span className="font-medium" style={{ color: '#1A2332' }}>3</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span style={{ color: '#6B7C93' }}>Encryption</span>
                <span className="font-medium flex items-center gap-1" style={{ color: '#1A2332' }}><Shield size={10} /> AES-256</span>
              </div>
            </div>
          </div>
        </Section>

        {/* Footer */}
        <p className="text-center text-[11px] pb-4" style={{ color: '#6B7C93' }}>
          PediLog v1.0.0 · Built for Pediatric Physicians
        </p>
      </div>

      <SettingsExportSheet open={exportOpen} onOpenChange={setExportOpen} />
      <CreateBackupSheet
        open={backupSheetOpen}
        onOpenChange={setBackupSheetOpen}
        defaultLocation={lastBackupInfo?.destination || 'local'}
        onBackupComplete={(destination: 'local' | 'gdrive') => {
          const now = new Date();
          setLastBackupInfo({
            date: now.toISOString().slice(0, 10) + ' · ' + now.toTimeString().slice(0, 5),
            size: 'calculating...',
            destination,
          });
        }}
      />
    </div>
  );
};

export default SettingsScreen;
