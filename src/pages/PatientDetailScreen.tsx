import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit2, ChevronRight, FileText, Plus } from 'lucide-react';

const mockPatient = {
  patientId: '1', name: 'Lucas Miller', age: 7, gender: 'male',
  createdAt: '2024-06-10', updatedAt: '2025-01-15',
};

const mockCases = [
  { caseId: '1', date: '2025-01-15', complaint: 'Persistent cough', diagnosis: 'Acute bronchitis', mediaCount: 2 },
  { caseId: '7', date: '2024-11-20', complaint: 'Fever', diagnosis: 'Viral infection', mediaCount: 0 },
  { caseId: '8', date: '2024-09-05', complaint: 'Rash', diagnosis: 'Contact dermatitis', mediaCount: 3 },
  { caseId: '9', date: '2024-06-10', complaint: 'Well-child check', diagnosis: 'Healthy', mediaCount: 0 },
];

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
              className="p-3 bg-card border border-border rounded-xl flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer hover:shadow-card"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center text-primary">
                  <FileText size={16} />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-foreground">{c.complaint}</h4>
                  <p className="text-[11px] text-muted-foreground">{c.date}</p>
                  <p className="text-[11px] text-muted-foreground/70">{c.diagnosis}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {c.mediaCount > 0 && (
                  <span className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-bold">{c.mediaCount} 📷</span>
                )}
                <ChevronRight size={16} className="text-muted-foreground" />
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
        className="fixed bottom-[84px] right-1/2 translate-x-[195px] w-14 h-14 bg-primary rounded-[18px] flex items-center justify-center text-primary-foreground shadow-brand active:scale-90 transition-all z-50 group overflow-hidden"
        aria-label="Add Case"
      >
        <div className="absolute inset-0 bg-primary-foreground/10 group-active:bg-transparent" />
        <Plus size={28} />
      </button>
    </div>
  );
};

export default PatientDetailScreen;
