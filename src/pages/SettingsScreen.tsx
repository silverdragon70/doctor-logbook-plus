import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Timer, Database, HardDrive, Cloud, Info, Shield, ChevronRight } from 'lucide-react';

const SettingsScreen = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Security',
      items: [
        { icon: Lock, label: 'Change Encryption Password', desc: 'AES-256 SQLCipher', action: () => console.log('change password') },
        { icon: Timer, label: 'Auto-Lock Timer', desc: '5 minutes', action: () => console.log('auto-lock') },
      ],
    },
    {
      title: 'Backup',
      items: [
        { icon: Database, label: 'Create Backup', desc: 'Last: Jan 15, 2025', action: () => navigate('/backup') },
        { icon: HardDrive, label: 'Restore from Backup', desc: 'Select backup file', action: () => console.log('restore') },
        { icon: Cloud, label: 'Google Drive Setup', desc: 'Not connected', action: () => console.log('gdrive') },
      ],
    },
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
        {sections.map((section) => (
          <div key={section.title} className="space-y-2">
            <h3 className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider px-1">{section.title}</h3>
            <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
              {section.items.map((item) => (
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
        ))}

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
