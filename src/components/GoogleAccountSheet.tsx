import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { X, Unplug, Link, Plus } from 'lucide-react';

export interface GoogleAccount {
  id: string;
  email: string;
  active: boolean;
}

interface GoogleAccountSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: GoogleAccount[];
  onConnect: () => void;
  onSetActive: (id: string) => void;
  onDisconnectOne: (id: string) => void;
  onDisconnectAll: () => void;
}

const GoogleAccountSheet = ({ open, onOpenChange, accounts, onConnect, onSetActive, onDisconnectOne, onDisconnectAll }: GoogleAccountSheetProps) => {
  const [confirmType, setConfirmType] = useState<'one' | 'all' | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);

  const hasAccounts = accounts.length > 0;

  const confirmDisconnectOne = (id: string) => {
    setTargetId(id);
    setConfirmType('one');
  };

  const confirmDisconnectAll = () => {
    setConfirmType('all');
  };

  const handleConfirm = () => {
    if (confirmType === 'one' && targetId) {
      onDisconnectOne(targetId);
    } else if (confirmType === 'all') {
      onDisconnectAll();
    }
    setConfirmType(null);
    setTargetId(null);
  };

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

          <div className="px-5 pb-6 overflow-y-auto">
            {hasAccounts ? (
              <>
                <label className="text-[12px] font-bold uppercase tracking-wider mb-2 block" style={{ color: '#6B7C93' }}>Connected Accounts</label>

                <div className="space-y-2 mb-4">
                  {accounts.map((acc) => (
                    <div
                      key={acc.id}
                      className="rounded-xl"
                      style={{
                        padding: '12px 16px',
                        background: acc.active ? '#EFF6FF' : '#F8FAFC',
                        border: acc.active ? '1.5px solid #2563EB' : '1px solid #DDE3EA',
                      }}
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: acc.active ? '#22C55E' : '#CBD5E1' }} />
                        <div className="flex-1 min-w-0">
                          <div className="text-[14px] font-bold truncate" style={{ color: '#1A2332' }}>{acc.email}</div>
                        </div>
                        <span
                          className="text-[10px] font-bold uppercase rounded-full flex-shrink-0"
                          style={{
                            padding: '2px 8px',
                            background: acc.active ? '#DCFCE7' : '#F1F5F9',
                            color: acc.active ? '#16A34A' : '#64748B',
                          }}
                        >
                          {acc.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex justify-end gap-2">
                        {!acc.active && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onSetActive(acc.id); }}
                            className="text-[12px] font-bold text-white rounded-lg"
                            style={{ padding: '6px 12px', background: '#2563EB' }}
                          >
                            Set Active
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); confirmDisconnectOne(acc.id); }}
                          className="text-[12px] font-bold rounded-lg"
                          style={{ padding: '6px 12px', background: '#fff', border: '1px solid #EF4444', color: '#EF4444' }}
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <button
                    onClick={onConnect}
                    className="w-full flex items-center justify-center gap-2 rounded-xl font-bold text-[14px]"
                    style={{ height: 48, background: '#fff', border: '1.5px dashed #2563EB', color: '#2563EB' }}
                  >
                    <Plus size={18} /> Log in to New Account
                  </button>

                  <button
                    onClick={confirmDisconnectAll}
                    className="w-full flex items-center justify-center gap-2 rounded-xl font-bold text-[14px]"
                    style={{ height: 48, background: '#fff', border: '1.5px solid #EF4444', color: '#EF4444' }}
                  >
                    <Unplug size={16} /> Disconnect All
                  </button>
                </div>
              </>
            ) : (
              <>
                <label className="text-[12px] font-bold uppercase tracking-wider mb-2 block" style={{ color: '#6B7C93' }}>No Account Connected</label>
                <div className="flex items-center gap-3 rounded-xl mb-4" style={{ padding: '12px 16px', background: '#F8FAFC', border: '1px solid #DDE3EA' }}>
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#CBD5E1' }} />
                  <div className="text-[14px] font-medium" style={{ color: '#6B7C93' }}>Not connected</div>
                </div>

                <p className="text-[12px] leading-[18px] text-center mb-4" style={{ color: '#6B7C93' }}>
                  Connect to enable Google Drive sync and cloud backup.
                </p>

                <button
                  onClick={onConnect}
                  className="w-full flex items-center justify-center gap-2 font-bold text-white rounded-xl"
                  style={{ height: 48, background: '#2563EB' }}
                >
                  <Link size={16} /> Connect Google Account
                </button>
              </>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={confirmType !== null} onOpenChange={(o) => { if (!o) setConfirmType(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Unplug size={20} style={{ color: '#EF4444' }} />
              {confirmType === 'all' ? 'Disconnect all accounts?' : 'Disconnect this account?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmType === 'all'
                ? 'This will disable Google Drive sync and cloud backup.'
                : 'This account will be removed from your connected accounts.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirm}
            >
              {confirmType === 'all' ? 'Disconnect All' : 'Disconnect'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default GoogleAccountSheet;
