import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Hospital, Stethoscope, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { BarChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ComposedChart, LabelList } from 'recharts';
import { useCases } from '@/hooks/useCases';
import { useStats } from '@/hooks/useStats';
import { useInsights } from '@/hooks/useAI';
import { useHospitals } from '@/hooks/useHospitals';
import { useProcedureStats } from '@/hooks/useProcedures';

const formatTimeAgo = (timestamp: number) => {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const GenderIcon = ({ gender, size = 13 }: { gender: 'male' | 'female'; size?: number }) => (
  <span
    className={`font-bold ${gender === 'male' ? 'text-blue-500' : 'text-rose-400'}`}
    style={{ fontSize: size, lineHeight: 1 }}
  >
    {gender === 'male' ? '♂' : '♀'}
  </span>
);

const statusColors = {
  red: { dot: 'bg-red-500', bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-900/50', text: 'text-red-700 dark:text-red-400' },
  yellow: { dot: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-900/50', text: 'text-amber-700 dark:text-amber-400' },
  green: { dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-900/50', text: 'text-emerald-700 dark:text-emerald-400' },
};

type TimeFilter = 'All' | 'This Month' | '3M' | '6M' | 'Year';

const StatsTab = () => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('All');
  const filters: TimeFilter[] = ['All', 'This Month', '3M', '6M', 'Year'];

  const periodMap: Record<TimeFilter, 'month' | '3months' | '6months' | 'year' | undefined> = {
    'All': undefined,
    'This Month': 'month',
    '3M': '3months',
    '6M': '6months',
    'Year': 'year',
  };

  const { data: stats } = useStats(periodMap[timeFilter]);
  const { data: procedureStats } = useProcedureStats();

  const admissionsData = stats?.admissionsPerMonth ?? [];
  const diagnosesData = stats?.topDiagnoses ?? [];
  const pStats = procedureStats ?? { total: 0, performed: 0, assisted: 0, observed: 0 };

  return (
    <div className="space-y-8 py-4 animate-fade-in">
      {/* Time Filter - text-only style */}
      <div className="flex gap-6 overflow-x-auto no-scrollbar">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setTimeFilter(f)}
            className={`pb-2 text-[13px] font-semibold whitespace-nowrap transition-all border-b-2 ${
              timeFilter === f
                ? 'text-primary border-primary'
                : 'text-[hsl(215,17%,62%)] border-transparent'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Section 1: Admissions per Month */}
      <div>
        <h3 className="text-[16px] font-bold text-foreground mb-4">Admissions per Month</h3>
        <div className="overflow-x-auto no-scrollbar -mx-2">
          <div style={{ minWidth: 500, height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={admissionsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(215,17%,62%)' }} axisLine={{ stroke: 'hsl(210,14%,93%)' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(215,17%,62%)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(210,14%,89%)', fontSize: 12, boxShadow: 'none' }} />
                <Bar dataKey="admissions" fill="hsl(221,83%,53%)" fillOpacity={0.6} radius={[4, 4, 0, 0]} barSize={20} />
                <Line type="monotone" dataKey="trend" stroke="hsl(168,62%,30%)" strokeWidth={1.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Separator */}
      <div className="h-px" style={{ backgroundColor: 'hsl(210,24%,95%)' }} />

      {/* Section 2: Top Diagnoses */}
      <div>
        <h3 className="text-[16px] font-bold text-foreground mb-4">Top Diagnoses</h3>
        <div className="overflow-x-auto no-scrollbar -mx-2">
          <div style={{ minWidth: 350, height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diagnosesData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: 'hsl(215,17%,62%)' }}
                  axisLine={{ stroke: 'hsl(210,14%,93%)' }}
                  tickLine={false}
                  interval={0}
                  tickFormatter={(v: string) => v.length > 10 ? v.slice(0, 9) + '…' : v}
                />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(215,17%,62%)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(210,14%,89%)', fontSize: 12, boxShadow: 'none' }} />
                <Bar dataKey="count" fill="hsl(221,83%,53%)" radius={[4, 4, 0, 0]} barSize={24}>
                  <LabelList dataKey="count" position="top" style={{ fontSize: 12, fontWeight: 700, fill: 'hsl(213,32%,15%)' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Separator */}
      <div className="h-px" style={{ backgroundColor: 'hsl(210,24%,95%)' }} />

      {/* Section 3: Procedures Stats */}
      <div>
        <h3 className="text-[16px] font-bold text-foreground mb-4">Procedures</h3>
        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
          {[
            { value: pStats.total, label: 'TOTAL' },
            { value: pStats.performed, label: 'PERFORMED' },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center justify-center py-2">
              <span className="text-[32px] font-bold text-primary">{item.value}</span>
              <span className="text-[11px] font-bold uppercase tracking-wider mt-1 text-[hsl(215,17%,62%)]">{item.label}</span>
            </div>
          ))}
        </div>
        <div className="h-px my-2" style={{ backgroundColor: 'hsl(210,24%,95%)' }} />
        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
          {[
            { value: pStats.assisted, label: 'ASSISTED' },
            { value: pStats.observed, label: 'OBSERVED' },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center justify-center py-2">
              <span className="text-[32px] font-bold text-primary">{item.value}</span>
              <span className="text-[11px] font-bold uppercase tracking-wider mt-1 text-[hsl(215,17%,62%)]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CasesScreen = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const { data: casesData = [], isLoading } = useCases(searchQuery ? { search: searchQuery } : undefined);
  const { data: stats } = useStats();
  const { data: hospitals = [] } = useHospitals();
  const { state: insightState, data: insightData, error: insightError, generate, reset } = useInsights();

  const defaultHospital = hospitals[0];

  const statsBar = [
    { label: 'TOTAL', value: String(stats?.totalCases ?? 0), className: 'text-primary' },
    { label: 'ACTIVE', value: String(stats?.activeCases ?? 0), className: 'text-secondary' },
    { label: 'DISCH', value: String(stats?.dischargedCases ?? 0), className: 'text-amber-500' },
  ];

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

      {/* Add Hospital */}
      <div className="flex justify-end -mb-4">
        <button
          onClick={() => navigate('/hospital/new')}
          className="text-[13px] text-primary font-semibold active:opacity-70 transition-opacity"
        >
          + Add New Hospital
        </button>
      </div>

      {/* Hospital Overview Card */}
      {defaultHospital && (
        <section onClick={() => navigate(`/hospital/${defaultHospital.id}`)} className="relative overflow-hidden bg-card border border-border rounded-2xl shadow-card cursor-pointer active:scale-[0.98] transition-all">
          <div className="h-1 w-full gradient-brand" />
          <div className="p-4 flex items-center gap-4">
            <div className="w-[44px] h-[44px] bg-accent rounded-xl flex items-center justify-center text-primary">
              <Hospital size={24} />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-foreground">{defaultHospital.name}</h3>
              <p className="text-[11px] text-muted-foreground">{defaultHospital.department} • {defaultHospital.location}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 border-t border-border">
            {statsBar.map((stat, idx) => (
              <div
                key={stat.label}
                className={`p-3 flex flex-col items-center justify-center ${idx !== statsBar.length - 1 ? 'border-r border-border' : ''}`}
              >
                <span className={`text-[18px] font-mono font-bold ${stat.className}`}>{stat.value}</span>
                <span className="text-[9px] font-bold text-muted-foreground tracking-wider mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

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
            {isLoading ? (
              <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-primary" size={24} /></div>
            ) : casesData.length === 0 ? (
              <div className="py-10 text-center text-[13px] text-muted-foreground">No cases found</div>
            ) : (
              casesData.map((c: any) => (
                <div
                  key={c.caseId || c.id}
                  onClick={() => navigate(`/patient/${c.patientId || c.caseId || c.id}`)}
                  className="group flex items-center justify-between p-3 bg-card border border-border rounded-xl active:scale-[0.98] transition-all cursor-pointer hover:shadow-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl gradient-avatar flex items-center justify-center text-primary-foreground font-bold text-[14px] shadow-sm">
                      {(c.patientName || c.patient_name || '').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-foreground">{c.patientName || c.patient_name}</h4>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        {c.gender && <GenderIcon gender={c.gender} size={12} />}
                        {c.room || ''} {c.lastModified ? `• ${formatTimeAgo(c.lastModified)}` : c.admission_date ? `• ${c.admission_date}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight uppercase bg-accent text-accent-foreground">
                    {c.specialty || c.department || '—'}
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'stats' && <StatsTab />}

        {activeTab === 'insights' && (
          <div className="space-y-3 py-4 animate-fade-in">
            {/* State 1: Ready */}
            {insightState === 'ready' && (
              <div className="p-10 flex flex-col items-center text-center">
                <button
                  onClick={generate}
                  className="w-16 h-16 bg-[#2563EB]/10 rounded-full flex items-center justify-center mb-4 active:scale-90 transition-transform cursor-pointer"
                >
                  <Stethoscope size={32} className="text-[#2563EB] animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
                </button>
                <h5 className="text-[16px] font-bold" style={{ color: '#1A2332' }}>Start Analysis</h5>
                <p className="text-[13px] mt-1 max-w-[220px]" style={{ color: '#6B7C93' }}>Tap to generate today's clinical summaries</p>
              </div>
            )}

            {/* State 2: Loading */}
            {insightState === 'loading' && (
              <div className="p-10 flex flex-col items-center text-center opacity-60">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Stethoscope size={32} className="text-muted-foreground animate-spin" style={{ animationDuration: '3s' }} />
                </div>
                <h5 className="text-[16px] font-bold" style={{ color: '#6B7C93' }}>AI Analysis in Progress</h5>
                <p className="text-[13px] mt-1 max-w-[240px]" style={{ color: '#94A3B8' }}>Generating daily clinical summaries for the pediatric ward.</p>
                <div className="mt-4 flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                  ))}
                </div>
              </div>
            )}

            {/* State 3: Error */}
            {insightState === 'error' && (
              <div className="p-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle size={32} className="text-destructive" />
                </div>
                <h5 className="text-[16px] font-bold text-foreground">Analysis Failed</h5>
                <p className="text-[13px] mt-1 max-w-[240px] text-muted-foreground">{insightError}</p>
                <button onClick={reset} className="mt-4 flex items-center gap-2 text-primary text-[13px] font-semibold">
                  <RefreshCw size={14} /> Try Again
                </button>
              </div>
            )}

            {/* State 4: Results */}
            {insightState === 'done' && insightData && (
              <div className="space-y-3 animate-fade-in">
                {insightData.groups.map((group: any) => {
                  const colors = statusColors[group.status as keyof typeof statusColors] || statusColors.green;
                  return (
                    <div key={group.status} className={`rounded-xl border ${colors.border} ${colors.bg} overflow-hidden`}>
                      <div className="px-4 py-2.5 flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                        <span className={`text-[13px] font-bold ${colors.text}`}>
                          {group.label} ({group.cases.length})
                        </span>
                      </div>
                      <div className="space-y-px">
                        {group.cases.map((c: any, idx: number) => (
                          <div key={idx} className="px-4 py-3 bg-card/50 border-t border-border/50">
                            <p className="text-[13px] font-semibold text-foreground mb-1">{c.name}</p>
                            <p className="text-[12px] text-muted-foreground leading-relaxed">{c.summary}</p>
                            <p className="text-[11px] font-medium text-primary mt-1.5">→ {c.recommendation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CasesScreen;
