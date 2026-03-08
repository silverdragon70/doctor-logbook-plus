import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit2, FileText, Plus, Loader2 } from 'lucide-react';
import { usePatient } from '@/hooks/usePatients';
import { usePatientCases } from '@/hooks/useCases';

const outcomeBadgeMap: Record<string, { label: string; bg: string; color: string }> = {
  cured: { label: 'Cured', bg: '#DBEAFE', color: '#2563EB' },
  followup: { label: 'Follow Up', bg: '#FEF9C3', color: '#CA8A04' },
  referred: { label: 'Referred', bg: '#EDE9FE', color: '#7C3AED' },
  transferred: { label: 'Transferred', bg: '#E0F2FE', color: '#0369A1' },
  lama: { label: 'LAMA', bg: '#FEF3C7', color: '#D97706' },
  chronic: { label: 'Chronic', bg: '#F1F5F9', color: '#475569' },
  homecare: { label: 'Home Care', bg: '#ECFDF5', color: '#059669' },
  died: { label: 'Died', bg: '#FEE2E2', color: '#DC2626' },
};

const PatientDetailScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: patientData, isLoading: patientLoading } = usePatient(id!);
  const { data: cases = [] } = usePatientCases(id!);

  const patient = patientData?.patient || patientData;

  if (patientLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p className="text-muted-foreground">Patient not found</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary text-sm font-semibold">Go Back</button>
      </div>
    );
  }

  const initials = (patient.name || '').split(' ').map((n: string) => n[0]).join('').slice(0, 2);
  const imageCount = patientData?.stats?.images ?? cases.reduce((sum: number, c: any) => sum + (c.mediaCount || 0), 0);
  const lastVisit = patientData?.stats?.lastVisit || (cases.length > 0 ? cases[0].date || cases[0].admission_date : '—');

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <header className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-muted text-muted-foreground">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-[16px] font-bold text-foreground">Patient Profile</h1>
        <button onClick={() => navigate(`/patient/${id}/edit`)} className="p-2 rounded-full hover:bg-muted text-muted-foreground">
          <Edit2 size={18} />
        </button>
      </header>

      <div className="px-5 py-5 space-y-5 pb-10">
        {/* Patient Card */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
          <div className="h-1 w-full gradient-brand" />
          <div className="p-5 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl gradient-avatar flex items-center justify-center text-primary-foreground font-bold text-[22px]">
              {initials}
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-foreground">{patient.name}</h2>
              <p className="text-[12px] text-muted-foreground mt-0.5">{patient.age} years • {patient.gender}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Since {patient.createdAt || patient.created_at}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 border-t border-border">
            <div className="p-3 flex flex-col items-center border-r border-border">
              <span className="text-[18px] font-mono font-bold text-primary">{cases.length}</span>
              <span className="text-[9px] font-bold text-muted-foreground tracking-wider">CASES</span>
            </div>
            <div className="p-3 flex flex-col items-center border-r border-border">
              <span className="text-[18px] font-mono font-bold text-secondary">{imageCount}</span>
              <span className="text-[9px] font-bold text-muted-foreground tracking-wider">IMAGES</span>
            </div>
            <div className="p-3 flex flex-col items-center">
              <span className="text-[12px] font-mono font-bold text-foreground">{typeof lastVisit === 'string' ? lastVisit.slice(0, 6) : lastVisit}</span>
              <span className="text-[9px] font-bold text-muted-foreground tracking-wider">LAST VISIT</span>
            </div>
          </div>
        </div>

        {/* Cases */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-foreground">Case History</h3>
            <span className="text-[11px] text-muted-foreground">{cases.length} records</span>
          </div>
          {cases.map((c: any) => (
            <div
              key={c.caseId || c.id}
              onClick={() => navigate(`/case/${c.caseId || c.id}`)}
              className="p-3 bg-card border border-border rounded-xl active:scale-[0.98] transition-all cursor-pointer hover:shadow-card"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                  <FileText size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-[15px] font-bold truncate" style={{ color: '#1A2332' }}>{c.diagnosis || c.provisional_diagnosis}</h4>
                    {c.status === 'active' ? (
                      <span className="text-[11px] font-bold uppercase flex-shrink-0" style={{ borderRadius: 20, padding: '4px 12px', backgroundColor: '#DCFCE7', color: '#16A34A' }}>
                        Hospitalized
                      </span>
                    ) : c.outcome && outcomeBadgeMap[c.outcome] ? (
                      <span className="text-[11px] font-bold uppercase flex-shrink-0" style={{ borderRadius: 20, padding: '4px 12px', backgroundColor: outcomeBadgeMap[c.outcome].bg, color: outcomeBadgeMap[c.outcome].color }}>
                        {outcomeBadgeMap[c.outcome].label}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-[13px] mt-0.5" style={{ color: '#6B7C93' }}>{c.complaint || c.chief_complaint} • {c.date || c.admission_date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAB — Add New Case */}
      <button
        onClick={() => navigate('/case/new', { state: { patientId: id } })}
        className="fixed bottom-[84px] left-1/2 translate-x-[110px] w-14 h-14 bg-primary rounded-[18px] flex items-center justify-center text-primary-foreground shadow-brand active:scale-90 transition-all z-50 group overflow-hidden"
        aria-label="Add Case"
      >
        <div className="absolute inset-0 bg-primary-foreground/10 group-active:bg-transparent" />
        <Plus size={28} />
      </button>
    </div>
  );
};

export default PatientDetailScreen;
