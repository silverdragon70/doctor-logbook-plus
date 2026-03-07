import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Timer, Database, HardDrive, Cloud, Shield, ChevronRight, ChevronDown, ChevronUp, Clock, Download, Upload, CheckCircle } from 'lucide-react';

const backupHistory = [
  { id: '1', type: 'Full Backup', date: '2025-01-15 08:30', size: '245 MB', status: 'success' },
  { id: '2', type: 'Data Only', date: '2025-01-14 14:20', size: '12 MB', status: 'success' },
  { id: '3', type: 'Incremental', date: '2025-01-13 09:00', size: '5 MB', status: 'success' },
];

const backupOptions = [
  { label: 'Full Backup', desc: 'Database + All Images', icon: Database, time: '< 5 min' },
  { label: 'Incremental', desc: 'Changes since last backup', icon: Clock, time: '< 30 sec' },
  { label: 'Data Only', desc: 'Database only, no images', icon: HardDrive, time: '< 1 min' },
];

const SettingsScreen = () => {
  const navigate = useNavigate();
  const [backupExpanded, setBackupExpanded] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [progress, setProgress] = useState(0);

  const simulateBackup = (type: string) => {
    console.log('backup', type);
    setIsBackingUp(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(interval); setIsBackingUp(false); return 100; }
        return prev + 10;
      });
    }, 300);
  };

  const securityItems = [
    { icon: Lock, label: 'Change Encryption Password', desc: 'AES-256 SQLCipher', action: () => console.log('change password') },
    { icon: Timer, label: 'Auto-Lock Timer', desc: '5 minutes', action: () => console.log('auto-lock') },
  ];

  const statistics = [
    { label: 'Patients', value: '142' },
    { label: 'Cases', value: '387' },
    { label: 'Images', value: '1,204' },
    { label: 'Storage Used', value: '2.4 GB' },
  ];

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <header className="sticky top-0 z-50 px-4 py-3 flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-muted text-muted-foreground">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-[16px] font-bold text-foreground">Settings</h1>
      </header>

      <div className="px-5 py-5 space-y-6 pb-10">
        {/* Security */}
        <div className="space-y-2">
          <h3 className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider px-1">Security</h3>
          <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
            {securityItems.map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center text-primary">
                  <item.icon size={18} />
                </div>
                <div className="flex-1">
                  <h4 className="text-[13px] font-semibold text-foreground">{item.label}</h4>
                  <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>

        {/* Backup & Restore */}
        <div className="space-y-2">
          <button
            onClick={() => setBackupExpanded(!backupExpanded)}
            className="w-full flex items-center justify-between px-1"
          >
            <h3 className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">Backup & Restore</h3>
            {backupExpanded ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
          </button>

          {!backupExpanded ? (
            <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
              <button
                onClick={() => setBackupExpanded(true)}
                className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center text-primary">
                  <Database size={18} />
                </div>
                <div className="flex-1">
                  <h4 className="text-[13px] font-semibold text-foreground">Create Backup</h4>
                  <p className="text-[11px] text-muted-foreground">Last: Jan 15, 2025</p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </button>
              <button
                onClick={() => console.log('restore')}
                className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center text-primary">
                  <Download size={18} />
                </div>
                <div className="flex-1">
                  <h4 className="text-[13px] font-semibold text-foreground">Restore from Backup</h4>
                  <p className="text-[11px] text-muted-foreground">Select backup file</p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </button>
              <button
                onClick={() => console.log('gdrive')}
                className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center text-primary">
                  <Cloud size={18} />
                </div>
                <div className="flex-1">
                  <h4 className="text-[13px] font-semibold text-foreground">Google Drive Setup</h4>
                  <p className="text-[11px] text-muted-foreground">Not connected</p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </button>
            </div>
          ) : (
            <div className="space-y-3 animate-fade-in">
              {/* Backup Options */}
              {backupOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => simulateBackup(opt.label)}
                  disabled={isBackingUp}
                  className="w-full p-4 bg-card border border-border rounded-xl flex items-center gap-4 active:scale-[0.98] transition-all hover:shadow-card text-left disabled:opacity-50"
                >
                  <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-primary">
                    <opt.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[14px] font-bold text-foreground">{opt.label}</h4>
                    <p className="text-[11px] text-muted-foreground">{opt.desc} • {opt.time}</p>
                  </div>
                  <Upload size={16} className="text-muted-foreground" />
                </button>
              ))}

              {/* Progress */}
              {isBackingUp && (
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-foreground">Backing up...</span>
                    <span className="text-[12px] font-mono font-bold text-primary">{progress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {/* Restore */}
              <div className="bg-card border border-border rounded-xl p-4">
                <button onClick={() => console.log('restore')} className="w-full flex items-center gap-3 text-left">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-xl flex items-center justify-center text-amber-600">
                    <Download size={20} />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-foreground">Restore from Backup</h4>
                    <p className="text-[11px] text-muted-foreground">Select a backup file to restore</p>
                  </div>
                </button>
              </div>

              {/* Storage Options */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1">Storage Options</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-card border border-border rounded-xl text-center">
                    <HardDrive size={20} className="text-primary mx-auto mb-2" />
                    <div className="text-[12px] font-bold text-foreground">Local</div>
                    <div className="text-[10px] text-muted-foreground">Device storage</div>
                  </div>
                  <div className="p-4 bg-card border border-border rounded-xl text-center opacity-60">
                    <Cloud size={20} className="text-primary mx-auto mb-2" />
                    <div className="text-[12px] font-bold text-foreground">Google Drive</div>
                    <div className="text-[10px] text-muted-foreground">Not connected</div>
                  </div>
                </div>
              </div>

              {/* History */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1">Backup History</h4>
                {backupHistory.map((b) => (
                  <div key={b.id} className="p-3 bg-card border border-border rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle size={16} className="text-secondary" />
                      <div>
                        <h4 className="text-[13px] font-bold text-foreground">{b.type}</h4>
                        <p className="text-[10px] text-muted-foreground">{b.date} • {b.size}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="space-y-2">
          <h3 className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider px-1">Statistics</h3>
          <div className="grid grid-cols-2 gap-3">
            {statistics.map((stat) => (
              <div key={stat.label} className="p-4 bg-card border border-border rounded-xl">
                <div className="text-[18px] font-mono font-bold text-primary">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* About */}
        <div className="space-y-2">
          <h3 className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider px-1">About</h3>
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-brand">
                <span className="text-primary-foreground font-bold text-lg">P</span>
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-foreground">PediLog</h4>
                <p className="text-[11px] text-muted-foreground">Medical Logbook v2.1</p>
              </div>
            </div>
            <div className="space-y-1 pt-2 border-t border-border">
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">App Version</span>
                <span className="text-foreground font-medium">2.1.0</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Schema Version</span>
                <span className="text-foreground font-medium">3</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Encryption</span>
                <span className="text-foreground font-medium flex items-center gap-1"><Shield size={10} /> AES-256</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
