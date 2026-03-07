import React, { useState } from 'react';
import { Database, HardDrive, Cloud, Download, Upload, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

const backupHistory = [
  { id: '1', type: 'Full Backup', date: '2025-01-15 08:30', size: '245 MB', status: 'success' },
  { id: '2', type: 'Data Only', date: '2025-01-14 14:20', size: '12 MB', status: 'success' },
  { id: '3', type: 'Incremental', date: '2025-01-13 09:00', size: '5 MB', status: 'success' },
];

const BackupScreen = () => {
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

  return (
    <div className="px-5 py-6 space-y-5 animate-fade-in">
      <h2 className="text-[18px] font-bold text-foreground">Backup & Restore</h2>

      {/* Backup Options */}
      <div className="space-y-3">
        {[
          { label: 'Full Backup', desc: 'Database + All Images', icon: Database, time: '< 5 min' },
          { label: 'Incremental', desc: 'Changes since last backup', icon: Clock, time: '< 30 sec' },
          { label: 'Data Only', desc: 'Database only, no images', icon: HardDrive, time: '< 1 min' },
        ].map((opt) => (
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
      </div>

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
        <button
          onClick={() => console.log('restore')}
          className="w-full flex items-center gap-3 text-left"
        >
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-xl flex items-center justify-center text-amber-600">
            <Download size={20} />
          </div>
          <div>
            <h4 className="text-[14px] font-bold text-foreground">Restore from Backup</h4>
            <p className="text-[11px] text-muted-foreground">Select a backup file to restore</p>
          </div>
        </button>
      </div>

      {/* Storage */}
      <div className="space-y-3">
        <h3 className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">Storage Options</h3>
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
      <div className="space-y-3">
        <h3 className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">Backup History</h3>
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
  );
};

export default BackupScreen;
