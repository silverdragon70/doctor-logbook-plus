import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { X, FolderOpen, Cloud, AlertTriangle, Package } from 'lucide-react';

type RestoreType = 'full' | 'data';
type Step = 'select' | 'confirm';

interface RestoreBackupSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRestore: (type: RestoreType) => void;
}

const RestoreBackupSheet = ({ open, onOpenChange, onRestore }: RestoreBackupSheetProps) => {
  const [step, setStep] = useState<Step>('select');
  const [restoreType, setRestoreType] = useState<RestoreType>('full');

  const reset = () => {
    setStep('select');
    setRestoreType('full');
  };

  const handleClose = (o: boolean) => {
    if (!o) reset();
    onOpenChange(o);
  };

  const simulateFilePick = () => {
    // Simulates file selection
    setStep('confirm');
  };

  const handleRestore = () => {
    onRestore(restoreType);
    handleClose(false);
  };

  return (
    <Drawer open={open} onOpenChange={handleClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="flex items-center justify-between px-5 pb-2">
          <DrawerTitle className="text-[17px] font-bold" style={{ color: '#1A2332' }}>Restore from Backup</DrawerTitle>
          <DrawerClose asChild>
            <button className="p-1.5 rounded-full hover:bg-muted"><X size={20} style={{ color: '#6B7C93' }} /></button>
          </DrawerClose>
        </DrawerHeader>

        <div className="px-5 pb-6 overflow-y-auto">
          {step === 'select' && (
            <>
              <label className="text-[12px] font-bold uppercase tracking-wider mb-2 block" style={{ color: '#6B7C93' }}>Select Backup File</label>

              <div className="space-y-2 mb-4">
                <button
                  onClick={simulateFilePick}
                  className="w-full flex items-center gap-3 rounded-xl text-left transition-colors hover:bg-blue-50/50"
                  style={{ padding: '14px 16px', background: '#F8FAFC', border: '1.5px solid #DDE3EA' }}
                >
                  <FolderOpen size={22} style={{ color: '#2563EB' }} />
                  <div>
                    <div className="text-[14px] font-bold" style={{ color: '#1A2332' }}>Browse Device</div>
                    <div className="text-[12px]" style={{ color: '#6B7C93' }}>Select from Files app</div>
                  </div>
                </button>

                <button
                  onClick={simulateFilePick}
                  className="w-full flex items-center gap-3 rounded-xl text-left transition-colors hover:bg-blue-50/50"
                  style={{ padding: '14px 16px', background: '#F8FAFC', border: '1.5px solid #DDE3EA' }}
                >
                  <Cloud size={22} style={{ color: '#22C55E' }} />
                  <div>
                    <div className="text-[14px] font-bold" style={{ color: '#1A2332' }}>Browse Google Drive</div>
                    <div className="text-[12px]" style={{ color: '#6B7C93' }}>Select from G-Drive</div>
                  </div>
                </button>
              </div>

              <div className="flex items-start gap-2 rounded-xl p-3" style={{ background: '#FFFBEB' }}>
                <AlertTriangle size={16} style={{ color: '#F59E0B' }} className="flex-shrink-0 mt-0.5" />
                <p className="text-[12px] leading-[18px]" style={{ color: '#92400E' }}>
                  Only PediLog backup files are supported (.pedilog)
                </p>
              </div>
            </>
          )}

          {step === 'confirm' && (
            <>
              <label className="text-[12px] font-bold uppercase tracking-wider mb-2 block" style={{ color: '#6B7C93' }}>Selected File</label>
              <div className="flex items-center gap-3 rounded-xl mb-5" style={{ padding: '12px 16px', background: '#F8FAFC', border: '1px solid #DDE3EA' }}>
                <Package size={22} style={{ color: '#2563EB' }} />
                <div>
                  <div className="text-[14px] font-bold" style={{ color: '#1A2332' }}>backup_2025-01-15.pedilog</div>
                  <div className="text-[12px]" style={{ color: '#6B7C93' }}>245 MB · Full Backup</div>
                  <div className="text-[11px]" style={{ color: '#94A3B8' }}>Created: 15 Jan 2025</div>
                </div>
              </div>

              <label className="text-[12px] font-bold uppercase tracking-wider mb-2 block" style={{ color: '#6B7C93' }}>What to Restore</label>
              <div className="space-y-2 mb-5">
                {([
                  { id: 'full' as RestoreType, label: 'Data + Images', subtitle: 'Restore everything' },
                  { id: 'data' as RestoreType, label: 'Data Only', subtitle: 'Restore records only, no images' },
                ]).map((opt) => {
                  const isSelected = restoreType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setRestoreType(opt.id)}
                      className="w-full flex items-center gap-3 rounded-xl text-left transition-colors"
                      style={{ padding: '12px 16px', background: isSelected ? '#EFF6FF' : '#F8FAFC', border: `1.5px solid ${isSelected ? '#2563EB' : '#DDE3EA'}` }}
                    >
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: isSelected ? '#2563EB' : '#CBD5E1' }}>
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#2563EB' }} />}
                      </div>
                      <div>
                        <div className="text-[14px] font-bold" style={{ color: '#1A2332' }}>{opt.label}</div>
                        <div className="text-[12px]" style={{ color: '#6B7C93' }}>{opt.subtitle}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-start gap-2 rounded-xl p-3 mb-5" style={{ background: '#FEF2F2' }}>
                <AlertTriangle size={16} style={{ color: '#EF4444' }} className="flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[12px] font-bold mb-0.5" style={{ color: '#DC2626' }}>WARNING</div>
                  <p className="text-[12px] leading-[18px]" style={{ color: '#991B1B' }}>
                    This will <strong>OVERWRITE</strong> all current data on your device. This action cannot be undone.
                  </p>
                </div>
              </div>

              <button
                onClick={handleRestore}
                className="w-full font-bold text-white rounded-xl"
                style={{ height: 52, background: '#EF4444' }}
              >
                Restore Now
              </button>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default RestoreBackupSheet;
