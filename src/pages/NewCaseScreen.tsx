import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Camera, User, Calendar, Search, X } from 'lucide-react';

const existingPatients = [
  { patientId: '1', name: 'Lucas Miller', fileNumber: 'PED-2024-001', age: '4 years', gender: 'male' as const },
  { patientId: '2', name: 'Sophia Chen', fileNumber: 'PED-2024-002', age: '7 years', gender: 'female' as const },
  { patientId: '3', name: 'Ethan Wright', fileNumber: 'PED-2024-003', age: '2 years', gender: 'male' as const },
  { patientId: '4', name: 'Maya Johnson', fileNumber: 'PED-2024-004', age: '5 years', gender: 'female' as const },
];

const GenderIcon = ({ gender, size = 13 }: { gender: 'male' | 'female'; size?: number }) => (
  <span
    className={`font-bold ${gender === 'male' ? 'text-blue-500' : 'text-rose-400'}`}
    style={{ fontSize: size, lineHeight: 1 }}
  >
    {gender === 'male' ? '♂' : '♀'}
  </span>
);

const formFields = [
  { key: 'complaint', label: 'Chief Complaint', placeholder: 'What brought the patient in?', lines: 2 },
  { key: 'history', label: 'History', placeholder: 'Relevant medical history...', lines: 3 },
  { key: 'examination', label: 'Examination', placeholder: 'Physical exam findings...', lines: 3 },
  { key: 'investigations', label: 'Investigations', placeholder: 'Lab results, imaging...', lines: 2 },
  { key: 'diagnosis', label: 'Diagnosis', placeholder: 'Working or final diagnosis...', lines: 2 },
  { key: 'management', label: 'Management', placeholder: 'Treatment plan...', lines: 3 },
  { key: 'notes', label: 'Notes', placeholder: 'Additional notes...', lines: 2 },
];

const NewCaseScreen = () => {
  const navigate = useNavigate();
  const [patientMode, setPatientMode] = useState<'new' | 'existing'>('new');
  const [selectedPatient, setSelectedPatient] = useState<typeof existingPatients[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return existingPatients.filter(
      (p) => p.name.toLowerCase().includes(q) || p.fileNumber.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleSelectPatient = (patient: typeof existingPatients[0]) => {
    setSelectedPatient(patient);
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  const handleClearPatient = () => {
    setSelectedPatient(null);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header */}
      <header className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-muted text-muted-foreground">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-[16px] font-bold text-foreground">New Case</h1>
        <button
          onClick={() => { console.log('save case'); navigate(-1); }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-[13px] font-bold active:scale-95 transition-transform"
        >
          <Save size={14} className="inline mr-1" /> Save
        </button>
      </header>

      <div className="px-5 py-5 space-y-5 pb-10">
        {/* Patient Selection */}
        <div className="space-y-3">
          <div className="p-1 bg-muted rounded-xl flex gap-1">
            <button
              onClick={() => setPatientMode('new')}
              className={`flex-1 py-2 text-[13px] font-semibold rounded-lg transition-all ${
                patientMode === 'new' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'
              }`}
            >
              New Patient
            </button>
            <button
              onClick={() => setPatientMode('existing')}
              className={`flex-1 py-2 text-[13px] font-semibold rounded-lg transition-all ${
                patientMode === 'existing' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Existing Patient
            </button>
          </div>

          {patientMode === 'existing' ? (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {selectedPatient ? (
                <div className="p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User size={18} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-foreground flex items-center gap-1.5">
                      {selectedPatient.name}
                      <GenderIcon gender={selectedPatient.gender} size={14} />
                    </p>
                    <p className="text-[12px] text-muted-foreground mt-0.5">{selectedPatient.fileNumber}</p>
                    <p className="text-[12px] text-muted-foreground">{selectedPatient.age}</p>
                  </div>
                  <button
                    onClick={handleClearPatient}
                    className="p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <div className="px-4 py-3 flex items-center gap-2 border-b border-border">
                    <Search size={16} className="text-muted-foreground" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)}
                      placeholder="Search by name or file number..."
                      className="flex-1 text-[13px] text-foreground placeholder:text-muted-foreground bg-transparent focus:outline-none"
                    />
                  </div>
                  {searchQuery.trim() && (
                    <div className="max-h-[200px] overflow-y-auto divide-y divide-border">
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map((p) => (
                          <button
                            key={p.patientId}
                            onMouseDown={() => handleSelectPatient(p)}
                            className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-center justify-between"
                          >
                            <span className="text-[13px] font-medium text-foreground">{p.name}</span>
                            <span className="text-[11px] text-muted-foreground">{p.fileNumber}</span>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-4 text-center text-[13px] text-muted-foreground">
                          No patients found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <input
                placeholder="Patient Name *"
                className="w-full h-10 px-3 bg-muted/50 border border-border rounded-lg text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Age"
                  type="number"
                  className="h-10 px-3 bg-muted/50 border border-border rounded-lg text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
                <select
                  className="h-10 px-3 bg-muted/50 border border-border rounded-lg text-[13px] text-foreground focus:outline-none focus:border-primary"
                  defaultValue=""
                >
                  <option value="" disabled>Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Date */}
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <Calendar size={18} className="text-primary" />
          <div className="flex-1">
            <span className="text-[11px] text-muted-foreground uppercase font-bold">Case Date</span>
            <input
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              className="block w-full text-[14px] font-semibold text-foreground bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* Clinical Fields */}
        {formFields.map((field) => (
          <div key={field.key} className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border">
              <span className="text-[12px] font-bold text-foreground">{field.label}</span>
            </div>
            <textarea
              placeholder={field.placeholder}
              rows={field.lines}
              className="w-full px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground bg-transparent focus:outline-none resize-none"
            />
          </div>
        ))}

        {/* Media */}
        <div className="bg-card border border-border rounded-xl p-4">
          <span className="text-[12px] font-bold text-foreground block mb-3">Attach Images</span>
          <div className="flex gap-3">
            <button
              onClick={() => console.log('camera')}
              className="w-20 h-20 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <Camera size={20} />
              <span className="text-[9px] font-bold mt-1">CAPTURE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewCaseScreen;
