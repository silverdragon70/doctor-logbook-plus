import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Moon, Sun, Settings, Activity, Search, Users, Plus, ClipboardList } from 'lucide-react';

const AppShell = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const navItems = [
    { icon: Activity, label: 'Cases', path: '/cases' },
    { icon: Users, label: 'Patients', path: '/' },
    { icon: ClipboardList, label: 'Logbook', path: '/logbook' },
    { icon: Search, label: 'Search', path: '/search' },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Hide shell chrome on detail pages
  const isDetailPage = location.pathname.includes('/case/') || location.pathname.includes('/patient/');

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="max-w-[430px] mx-auto min-h-screen relative flex flex-col border-x border-border bg-background shadow-elevated">
        
        {/* HEADER */}
        {!isDetailPage && (
          <header className="sticky top-0 z-50 px-5 py-4 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-[34px] h-[34px] bg-primary rounded-lg flex items-center justify-center shadow-brand">
                <span className="text-primary-foreground font-bold text-lg">P</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-[18px] font-bold text-foreground leading-none">PediLog</h1>
                <span className="text-[11px] font-normal tracking-[0.5px] text-muted-foreground mt-1 uppercase">Medical Logbook</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
              >
                <Settings size={20} />
              </button>
            </div>
          </header>
        )}

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto pb-32">
          <Outlet />
        </main>

        {/* BOTTOM NAV */}
        {!isDetailPage && (
          <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-[72px] bg-card/90 backdrop-blur-xl border-t border-border flex items-center justify-around px-6 z-40">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center transition-colors ${
                  isActive(item.path) ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <item.icon size={24} />
                <span className={`text-[10px] mt-1 ${isActive(item.path) ? 'font-bold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </nav>
        )}

        {/* FAB */}
        {!isDetailPage && (
          <button
            onClick={() => navigate('/case/new')}
            className="fixed bottom-[84px] left-1/2 translate-x-[110px] w-14 h-14 bg-primary rounded-[18px] flex items-center justify-center text-primary-foreground shadow-brand active:scale-90 transition-all z-50 group overflow-hidden"
            aria-label="Add Case"
          >
            <div className="absolute inset-0 bg-primary-foreground/10 group-active:bg-transparent" />
            <Plus size={28} />
          </button>
        )}
      </div>
    </div>
  );
};

export default AppShell;
