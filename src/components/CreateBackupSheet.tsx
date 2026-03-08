import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { X, Database, Zap, FileText, HardDrive, Cloud, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type BackupType = 'full' | 'incremental' | 'data';
type SaveLocation = 'local' | 'gdrive';

interface BackupOption {
  id: BackupType;
  icon: React.ElementType;
  label: string;
  subtitle: string;
  lastDate: string;
  lastSize: string;
}

const backupOptions: BackupOption[] = [
  { id: 'full', icon: Database, label: 'Full Backup', subtitle: 'Database + All Images', lastDate: '2025-01-15', lastSize: '245MB' },
  { id: 'incremental', icon: Zap, label: 'Incremental', subtitle: 'Only new changes (faster & smaller)', lastDate: '2025-01-13', lastSize: '5MB' },
  { id: 'data', icon: FileText, label: 'Data Only', subtitle: 'Database only, no images', lastDate: '2025-01-14', lastSize: '12MB' },
];

interface CreateBackupSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultLocation: SaveLocation;
  onBackupComplete: (destination: SaveLocation) => void;
}

const CreateBackupSheet = ({ open, onOpenChange, defaultLocation, onBackupComplete }: CreateBackupSheetProps) => {
  const [selectedType, setSelectedType] = useState<BackupType | null>(null);
  const [saveLocation, setSaveLocation] = useState<SaveLocation>(defaultLocation);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  

  const handleStartBackup = () => {
    if (!selectedType) return;
    setIsRunning(true);
    setError(null);

    // Simulate backup
    setTimeout(() => {
      setIsRunning(false);
      onOpenChange(false);
      onBackupComplete();
      toast({ title: 'Backup completed ✓', description: `${backupOptions.find(o => o.id === selectedType)?.label} saved to ${saveLocation === 'local' ? 'Device' : 'Google Drive'}.` });
      setSelectedType(null);
    }, 2500);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="flex items-center justify-between px-5 pb-2">
          <DrawerTitle className="text-[17px] font-bold" style={{ color: '#1A2332' }}>Create Backup</DrawerTitle>
          <DrawerClose asChild>
            <button className="p-1.5 rounded-full hover:bg-muted"><X size={20} style={{ color: '#6B7C93' }} /></button>
          </DrawerClose>
        </DrawerHeader>

        <div className="px-5 pb-8 space-y-5 overflow-y-auto">
          {/* Backup Type Selection */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#6B7C93' }}>Select Backup Type</h4>
            <div className="space-y-2.5">
              {backupOptions.map((opt) => {
                const Icon = opt.icon;
                const selected = selectedType === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedType(opt.id)}
                    className="w-full text-left p-4 rounded-xl transition-all"
                    style={{
                      background: selected ? '#EFF6FF' : '#F8FAFC',
                      border: `1.5px solid ${selected ? '#2563EB' : '#DDE3EA'}`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} style={{ color: selected ? '#2563EB' : '#6B7C93' }} />
                      <div>
                        <div className="text-[14px] font-bold" style={{ color: '#1A2332' }}>{opt.label}</div>
                        <div className="text-[12px]" style={{ color: '#6B7C93' }}>{opt.subtitle}</div>
                        <div className="text-[11px] mt-0.5" style={{ color: '#94A3B8' }}>
                          <span className="font-bold" style={{ color: '#6B7C93' }}>Last:</span> {opt.lastDate} · {opt.lastSize}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save To */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#6B7C93' }}>Save To</h4>
            <div className="relative">
              <button
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                className="w-full flex items-center justify-between p-3.5 rounded-xl text-left"
                style={{ background: '#F8FAFC', border: '1.5px solid #DDE3EA' }}
              >
                <div className="flex items-center gap-2.5">
                  {saveLocation === 'local' ? <HardDrive size={18} style={{ color: '#2563EB' }} /> : <Cloud size={18} style={{ color: '#2563EB' }} />}
                  <span className="text-[14px] font-medium" style={{ color: '#1A2332' }}>
                    {saveLocation === 'local' ? 'Local' : 'Google Drive'}
                  </span>
                </div>
                <span style={{ color: '#6B7C93' }}>▾</span>
              </button>
              {showLocationDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-10" style={{ background: '#fff', border: '1.5px solid #DDE3EA', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <button onClick={() => { setSaveLocation('local'); setShowLocationDropdown(false); }} className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-muted/40 text-left" style={{ borderBottom: '1px solid #F0F4F8' }}>
                    <HardDrive size={16} style={{ color: '#2563EB' }} />
                    <span className="text-[13px] font-medium" style={{ color: '#1A2332' }}>Local</span>
                  </button>
                  <button onClick={() => { setSaveLocation('gdrive'); setShowLocationDropdown(false); }} className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-muted/40 text-left">
                    <Cloud size={16} style={{ color: '#2563EB' }} />
                    <span className="text-[13px] font-medium" style={{ color: '#1A2332' }}>Google Drive</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-xl text-[13px] font-medium" style={{ background: '#FEE2E2', color: '#DC2626' }}>
              {error}
            </div>
          )}

          {/* Start Backup Button */}
          <button
            onClick={handleStartBackup}
            disabled={!selectedType || isRunning}
            className="w-full flex items-center justify-center gap-2 rounded-xl text-[15px] font-bold transition-colors"
            style={{
              height: 52,
              background: !selectedType ? '#D1D5DB' : '#2563EB',
              color: '#fff',
              opacity: isRunning ? 0.8 : 1,
            }}
          >
            {isRunning ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Backing up...
              </>
            ) : (
              <>
                <Database size={18} />
                Start Backup
              </>
            )}
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CreateBackupSheet;
