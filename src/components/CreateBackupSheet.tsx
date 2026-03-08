import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { X, Database, Zap, FileText, HardDrive, Cloud, Loader2, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

type BackupType = 'full' | 'incremental' | 'data';
type SaveLocation = 'local' | 'gdrive';
type TimePeriod = 'all' | 'custom';

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
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all');
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDisabled = !selectedType || isRunning || (timePeriod === 'custom' && (!fromDate || !toDate));

  const handleStartBackup = () => {
    if (isDisabled) return;
    onOpenChange(false);
    onBackupComplete(saveLocation);
    setSelectedType(null);
    setTimePeriod('all');
    setFromDate(undefined);
    setToDate(undefined);
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

          {/* Time Period */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#6B7C93' }}>Time Period</h4>
            <div className="space-y-2.5">
              {/* All Time */}
              <button
                onClick={() => setTimePeriod('all')}
                className="w-full text-left p-4 rounded-xl transition-all"
                style={{
                  background: timePeriod === 'all' ? '#EFF6FF' : '#F8FAFC',
                  border: `1.5px solid ${timePeriod === 'all' ? '#2563EB' : '#DDE3EA'}`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{ borderColor: timePeriod === 'all' ? '#2563EB' : '#CBD5E1' }}
                  >
                    {timePeriod === 'all' && <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#2563EB' }} />}
                  </div>
                  <div>
                    <div className="text-[14px] font-bold" style={{ color: '#1A2332' }}>All Time</div>
                    <div className="text-[12px]" style={{ color: '#6B7C93' }}>Backup everything</div>
                  </div>
                </div>
              </button>

              {/* Custom Period */}
              <button
                onClick={() => setTimePeriod('custom')}
                className="w-full text-left p-4 rounded-xl transition-all"
                style={{
                  background: timePeriod === 'custom' ? '#EFF6FF' : '#F8FAFC',
                  border: `1.5px solid ${timePeriod === 'custom' ? '#2563EB' : '#DDE3EA'}`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{ borderColor: timePeriod === 'custom' ? '#2563EB' : '#CBD5E1' }}
                  >
                    {timePeriod === 'custom' && <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#2563EB' }} />}
                  </div>
                  <div>
                    <div className="text-[14px] font-bold" style={{ color: '#1A2332' }}>Custom Period</div>
                    <div className="text-[12px]" style={{ color: '#6B7C93' }}>Select date range</div>
                  </div>
                </div>
              </button>

              {/* Custom date pickers */}
              {timePeriod === 'custom' && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <div className="text-[11px] font-bold uppercase mb-1.5" style={{ color: '#6B7C93' }}>From</div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className="w-full flex items-center gap-2 px-3 rounded-xl text-left text-[13px]"
                          style={{ height: 48, background: '#F8FAFC', border: '1.5px solid #DDE3EA' }}
                        >
                          <CalendarIcon size={14} style={{ color: '#6B7C93' }} />
                          <span style={{ color: fromDate ? '#1A2332' : '#94A3B8' }}>
                            {fromDate ? format(fromDate, 'MM/dd/yyyy') : 'mm/dd/yyyy'}
                          </span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={fromDate}
                          onSelect={setFromDate}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase mb-1.5" style={{ color: '#6B7C93' }}>To</div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className="w-full flex items-center gap-2 px-3 rounded-xl text-left text-[13px]"
                          style={{ height: 48, background: '#F8FAFC', border: '1.5px solid #DDE3EA' }}
                        >
                          <CalendarIcon size={14} style={{ color: '#6B7C93' }} />
                          <span style={{ color: toDate ? '#1A2332' : '#94A3B8' }}>
                            {toDate ? format(toDate, 'MM/dd/yyyy') : 'mm/dd/yyyy'}
                          </span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={toDate}
                          onSelect={setToDate}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Save To */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#6B7C93' }}>Save To</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSaveLocation('local')}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-bold transition-colors"
                style={{
                  background: saveLocation === 'local' ? '#2563EB' : '#fff',
                  color: saveLocation === 'local' ? '#fff' : '#1A2332',
                  border: saveLocation === 'local' ? '1.5px solid #2563EB' : '1.5px solid #DDE3EA',
                }}
              >
                <HardDrive size={14} /> Local
              </button>
              <button
                onClick={() => setSaveLocation('gdrive')}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-bold transition-colors"
                style={{
                  background: saveLocation === 'gdrive' ? '#2563EB' : '#fff',
                  color: saveLocation === 'gdrive' ? '#fff' : '#1A2332',
                  border: saveLocation === 'gdrive' ? '1.5px solid #2563EB' : '1.5px solid #DDE3EA',
                }}
              >
                <Cloud size={14} /> G-Drive
              </button>
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
            disabled={isDisabled}
            className="w-full flex items-center justify-center gap-2 rounded-xl text-[15px] font-bold transition-colors"
            style={{
              height: 52,
              background: isDisabled ? '#D1D5DB' : '#2563EB',
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
