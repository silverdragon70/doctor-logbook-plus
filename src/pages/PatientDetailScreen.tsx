import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit2, ChevronRight, FileText, Plus } from 'lucide-react';

const mockPatient = {
  patientId: '1', name: 'Lucas Miller', age: 7, gender: 'male',
  createdAt: '2024-06-10', updatedAt: '2025-01-15',
};

const mockCases = [
  { caseId: '1', date: '2025-01-15', complaint: 'Persistent cough', diagnosis: 'Acute bronchitis', mediaCount: 2, status: 'active' as const, outcome: null as string | null },
  { caseId: '7', date: '2024-11-20', complaint: 'Fever', diagnosis: 'Viral infection', mediaCount: 0, status: 'discharged' as const, outcome: 'cured' },
  { caseId: '8', date: '2024-09-05', complaint: 'Rash', diagnosis: 'Contact dermatitis', mediaCount: 3, status: 'discharged' as const, outcome: 'followup' },
  { caseId: '9', date: '2024-06-10', complaint: 'Well-child check', diagnosis: 'Healthy', mediaCount: 0, status: 'discharged' as const, outcome: 'homecare' },
];

const outcomeBadgeMap: Record<string, { label: string; bg: string; color: string }> = {
  cured: { label: 'Cured / Recovered', bg: '#DBEAFE', color: '#2563EB' },
  followup: { label: 'Follow Up Required', bg: '#FEF9C3', color: '#CA8A04' },
  referred: { label: 'Referred to Specialist', bg: '#EDE9FE', color: '#7C3AED' },
  transferred: { label: 'Transferred', bg: '#E0F2FE', color: '#0369A1' },
  lama: { label: 'LAMA', bg: '#FEF3C7', color: '#D97706' },
  chronic: { label: 'Chronic / Ongoing', bg: '#F1F5F9', color: '#475569' },
  homecare: { label: 'Home Care', bg: '#ECFDF5', color: '#059669' },
  died: { label: 'Died', bg: '#FEE2E2', color: '#DC2626' },
};

const PatientDetailScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <header className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-muted text-muted-foreground">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-[16px] font-bold text-foreground">Patient Profile</h1>
        <button onClick={() => navigate(`/patient/${mockPatient.patientId}/edit`)} className="p-2 rounded-full hover:bg-muted text-muted-foreground">
          <Edit2 size={18} />
        </button>
      </header>

      <div className="px-5 py-5 space-y-5 pb-10">
        {/* Patient Card */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
          <div className="h-1 w-full gradient-brand" />
          <div className="p-5 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl gradient-avatar flex items-center justify-center text-primary-foreground font-bold text-[22px]">
              LM
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-foreground">{mockPatient.name}</h2>
              <p className="text-[12px] text-muted-foreground mt-0.5">{mockPatient.age} years • {mockPatient.gender}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Since {mockPatient.createdAt}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 border-t border-border">
            <div className="p-3 flex flex-col items-center border-r border-border">
              <span className="text-[18px] font-mono font-bold text-primary">{mockCases.length}</span>
              <span className="text-[9px] font-bold text-muted-foreground tracking-wider">CASES</span>
            </div>
            <div className="p-3 flex flex-col items-center border-r border-border">
              <span className="text-[18px] font-mono font-bold text-secondary">5</span>
              <span className="text-[9px] font-bold text-muted-foreground tracking-wider">IMAGES</span>
            </div>
            <div className="p-3 flex flex-col items-center">
              <span className="text-[12px] font-mono font-bold text-foreground">Jan 15</span>
              <span className="text-[9px] font-bold text-muted-foreground tracking-wider">LAST VISIT</span>
            </div>
          </div>
        </div>

        {/* Cases */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-foreground">Case History</h3>
            <span className="text-[11px] text-muted-foreground">{mockCases.length} records</span>
          </div>
          {mockCases.map((c) => (
            <div
              key={c.caseId}
              onClick={() => navigate(`/case/${c.caseId}`)}
              className="p-3 bg-card border border-border rounded-xl active:scale-[0.98] transition-all cursor-pointer hover:shadow-card"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                  <FileText size={16} />
                </div>
                {/* BACKEND LOGIC — Case History Card Data Source
                   Line 1 (Diagnosis):      case.diagnosis field
                   Line 2 (Chief Complaint): case.chief_complaint field
                   Line 3 (Date):           case.admission_date field
                   All fields come from the same case record in the database
                   END BACKEND LOGIC */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-[15px] font-bold truncate" style={{ color: '#1A2332' }}>{c.diagnosis}</h4>
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
                  <p className="text-[13px] mt-0.5" style={{ color: '#6B7C93' }}>{c.complaint} • {c.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAB — Add New Case */}
      <button
        onClick={() => {
          // BACKEND LOGIC — Pre-fill Patient in New Case
          // When navigating to New Case from Patient Profile:
          // 1. Pass the current patient's ID to New Case screen
          // 2. New Case screen opens with "Existing Patient"
          //    option already selected
          // 3. Patient field is auto-filled with the current
          //    patient's data (name, ID)
          // 4. User skips the patient search step entirely
          // 5. Patient field should be read-only in this context
          //    since the patient is already known
          //
          // Source: pass patient.id as a navigation parameter
          // e.g. navigate('NewCase', { patientId: patient.id })
          // END BACKEND LOGIC
          navigate('/case/new');
        }}
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
