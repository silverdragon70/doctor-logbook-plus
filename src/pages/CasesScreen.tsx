import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Users, Activity, Hospital, Stethoscope } from 'lucide-react';

const mockCases = [
  { caseId: '1', patientName: 'Lucas Miller', initials: 'LM', department: 'Respiratory', tagColor: 'bg-accent text-accent-foreground', complaint: 'Persistent cough', diagnosis: 'Bronchitis', meta: 'Room 402 • 4h ago', mediaCount: 2 },
  { caseId: '2', patientName: 'Sophia Chen', initials: 'SC', department: 'Cardiology', tagColor: 'bg-destructive/10 text-destructive', complaint: 'Chest pain', diagnosis: 'Arrhythmia', meta: 'Room 215 • 12h ago', mediaCount: 5 },
  { caseId: '3', patientName: 'Ethan Wright', initials: 'EW', department: 'General', tagColor: 'bg-secondary/20 text-secondary', complaint: 'Fever & fatigue', diagnosis: 'Viral infection', meta: 'Room 108 • 1d ago', mediaCount: 0 },
  { caseId: '4', patientName: 'Maya Johnson', initials: 'MJ', department: 'Neurology', tagColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', complaint: 'Headache', diagnosis: 'Migraine', meta: 'Room 303 • 2d ago', mediaCount: 1 },
];

const stats = [
  { label: 'TOTAL', value: '142', className: 'text-primary' },
  { label: 'ACTIVE', value: '38', className: 'text-secondary' },
  { label: 'DISCH', value: '12', className: 'text-amber-500' },
];

const CasesScreen = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  return (
    <div className="px-5 py-6 space-y-6 animate-fade-in">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input
          type="text"
          placeholder="Search patient or department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-12 pl-12 pr-4 bg-card border border-border rounded-2xl text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all shadow-card"
        />
      </div>

      {/* Hospital Overview Card */}
      <section className="relative overflow-hidden bg-card border border-border rounded-2xl shadow-card">
        <div className="h-1 w-full gradient-brand" />
        <div className="p-4 flex items-center gap-4">
          <div className="w-[44px] h-[44px] bg-accent rounded-xl flex items-center justify-center text-primary">
            <Hospital size={24} />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-foreground">St. Jude Children's</h3>
            <p className="text-[11px] text-muted-foreground">Main Wing • Central Unit</p>
          </div>
        </div>
        <div className="grid grid-cols-3 border-t border-border">
          {stats.map((stat, idx) => (
            <div
              key={stat.label}
              className={`p-3 flex flex-col items-center justify-center ${idx !== stats.length - 1 ? 'border-r border-border' : ''}`}
            >
              <span className={`text-[18px] font-mono font-bold ${stat.className}`}>{stat.value}</span>
              <span className="text-[9px] font-bold text-muted-foreground tracking-wider mt-1">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Segmented Tabs */}
      <div className="p-1 bg-muted rounded-xl flex gap-1">
        {['list', 'stats', 'insights'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-[13px] font-semibold rounded-lg transition-all duration-200 ${
              activeTab === tab
                ? 'bg-card text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'list' ? 'Patient List' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-3">
        {activeTab === 'list' && (
          <>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[14px] font-bold text-foreground">Recent Cases</h3>
              <button className="text-[12px] text-primary font-medium">View All</button>
            </div>
            {mockCases.map((c) => (
              <div
                key={c.caseId}
                onClick={() => navigate(`/case/${c.caseId}`)}
                className="group flex items-center justify-between p-3 bg-card border border-border rounded-xl active:scale-[0.98] transition-all cursor-pointer hover:shadow-card"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-avatar flex items-center justify-center text-primary-foreground font-bold text-[14px] shadow-sm">
                    {c.initials}
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-foreground">{c.patientName}</h4>
                    <p className="text-[11px] text-muted-foreground">{c.meta}</p>
                  </div>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight uppercase ${c.tagColor}`}>
                  {c.department}
                </div>
              </div>
            ))}
          </>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-4 py-4 animate-fade-in">
            <div className="bg-card p-4 rounded-2xl border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-secondary" />
                  <span className="text-[13px] font-bold text-foreground">Admission Trends</span>
                </div>
                <span className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-semibold">+12% vs LW</span>
              </div>
              <div className="h-24 flex items-end justify-between gap-2 px-2">
                {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                  <div key={i} className="flex-1 bg-muted rounded-t-sm relative">
                    <div className="w-full bg-primary rounded-t-sm transition-all duration-500" style={{ height: `${h}%` }} />
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-card rounded-2xl border border-border">
                <Users size={18} className="text-primary mb-2" />
                <div className="text-[18px] font-mono font-bold text-foreground">12</div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold">New Patients</div>
              </div>
              <div className="p-4 bg-card rounded-2xl border border-border">
                <Activity size={18} className="text-destructive mb-2" />
                <div className="text-[18px] font-mono font-bold text-foreground">04</div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold">Critical Care</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-3 py-4 text-center animate-fade-in">
            <div className="p-10 flex flex-col items-center opacity-60">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Stethoscope size={32} className="text-muted-foreground" />
              </div>
              <h5 className="text-[14px] font-bold text-foreground">AI Analysis in Progress</h5>
              <p className="text-[11px] text-muted-foreground mt-1 max-w-[200px]">Generating daily clinical summaries for the pediatric ward.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CasesScreen;
