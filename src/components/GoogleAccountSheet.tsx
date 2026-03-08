import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { X, RefreshCw, Unplug, AlertTriangle } from 'lucide-react';

interface GoogleAccountSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  onSwitch: () => void;
  onDisconnect: () => void;
}

const GoogleAccountSheet = ({ open, onOpenChange, email, onSwitch, onDisconnect }: GoogleAccountSheetProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="flex items-center justify-between px-5 pb-2">
            <DrawerTitle className="text-[17px] font-bold" style={{ color: '#1A2332' }}>Google Account</DrawerTitle>
            <DrawerClose asChild>
              <button className="p-1.5 rounded-full hover:bg-muted"><X size={20} style={{ color: '#6B7C93' }} /></button>
            </DrawerClose>
          </DrawerHeader>
          <div className="px-5 pb-6 space-y-4">
            <div>
              <label className="text-[12px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: '#6B7C93' }}>Connected Account</label>
              <div className="flex items-center gap-3 rounded-xl" style={{ padding: '12px 16px', background: '#F8FAFC', border: '1px solid #DDE3EA' }}>
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#22C55E' }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-bold truncate" style={{ color: '#1A2332' }}>{email}</div>
                  <div className="text-[12px]" style={{ color: '#6B7C93' }}>Connected</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => { onSwitch(); onOpenChange(false); }}
              className="w-full flex items-center justify-center gap-2 font-bold text-white rounded-xl"
              style={{ height: 48, background: '#2563EB' }}
            >
              <RefreshCw size={16} /> Switch Account
            </button>

            <button
              onClick={() => setConfirmOpen(true)}
              className="w-full flex items-center justify-center gap-2 font-bold rounded-xl"
              style={{ height: 48, background: '#fff', border: '1.5px solid #EF4444', color: '#EF4444' }}
            >
              <Unplug size={16} /> Disconnect Account
            </button>

            <div className="flex items-start gap-2 rounded-xl p-3" style={{ background: '#FFFBEB' }}>
              <AlertTriangle size={16} style={{ color: '#F59E0B' }} className="flex-shrink-0 mt-0.5" />
              <p className="text-[12px] leading-[18px]" style={{ color: '#92400E' }}>
                Disconnecting will disable Google Drive sync and cloud backup features.
              </p>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Unplug size={20} style={{ color: '#EF4444' }} /> Disconnect Google Account?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will disable sync and cloud backup features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { onDisconnect(); onOpenChange(false); }}
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default GoogleAccountSheet;
