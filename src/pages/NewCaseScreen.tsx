import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Camera, User, Calendar, Search, X, CalendarIcon, ChevronDown, ClipboardList, Stethoscope, ScrollText, Activity, Pill, Wind, Baby, AirVent, Upload, FlaskConical } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const existingPatients = [
  { patientId: '1', name: 'Lucas Miller', fileNumber: 'PED-2024-001', age: '4 years', gender: 'male' as const },
  { patientId: '2', name: 'Sophia Chen', fileNumber: 'PED-2024-002', age: '7 years', gender: 'female' as const },
  { patientId: '3', name: 'Ethan Wright', fileNumber: 'PED-2024-003', age: '2 years', gender: 'male' as const },
  { patientId: '4', name: 'Maya Johnson', fileNumber: 'PED-2024-004', age: '5 years', gender: 'female' as const },
];

const specialties = [
  { value: 'cardiology', label: 'Cardiology' },
  { value: 'pulmonology', label: 'Pulmonology' },
  { value: 'gastroenterology', label: 'Gastroenterology' },
  { value: 'nephrology', label: 'Nephrology' },
  { value: 'neurology', label: 'Neurology' },
  { value: 'hematology', label: 'Hematology' },
  { value: 'endocrinology', label: 'Endocrinology' },
  { value: 'infectious-disease', label: 'Infectious Disease' },
  { value: 'neonatology', label: 'Neonatology' },
  { value: 'general-pediatrics', label: 'General Pediatrics' },
];

const hospitals = [
  { value: 'cairo-university', label: 'Cairo University Hospital' },
  { value: 'ain-shams', label: 'Ain Shams University Hospital' },
  { value: 'kasr-alainy', label: 'Kasr Al-Ainy Hospital' },
];

const GenderIcon = ({ gender, size = 13 }: { gender: 'male' | 'female'; size?: number }) => (
  <span
    className={`font-bold ${gender === 'male' ? 'text-blue-500' : 'text-rose-400'}`}
    style={{ fontSize: size, lineHeight: 1 }}
  >
    {gender === 'male' ? '♂' : '♀'}
  </span>
);

const inputClass =
  'w-full h-11 px-4 rounded-[12px] text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors'
  + ' bg-[hsl(210,40%,98%)] border-[1.5px] border-[hsl(216,20%,90%)] focus:border-primary';

const labelClass = 'text-[12px] font-bold uppercase tracking-wide';

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  rightLabel?: string;
  children: React.ReactNode;
}

const CollapsibleSection = ({ title, icon, isExpanded, onToggle, rightLabel, children }: CollapsibleSectionProps) => (
  <div className="bg-card border border-border rounded-[18px] overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full px-4 py-4 flex items-center justify-between"
    >
      <div className="flex items-center gap-2.5">
        {icon}
        <span className="text-[16px] font-bold" style={{ color: '#1A2332' }}>{title}</span>
      </div>
      <div className="flex items-center gap-2">
        {rightLabel && <span className="text-[12px]" style={{ color: '#6B7C93' }}>{rightLabel}</span>}
        <ChevronDown
          size={18}
          style={{ color: '#6B7C93' }}
          className={cn('transition-transform duration-300', isExpanded && 'rotate-180')}
        />
      </div>
    </button>
    <div
      className={cn(
        'overflow-hidden transition-all duration-300 ease-in-out',
        isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
      )}
    >
      <div className="px-4 pb-5 pt-1 border-t border-border">
        {children}
      </div>
    </div>
  </div>
);

const NewCaseScreen = () => {
  const navigate = useNavigate();
  const [patientMode, setPatientMode] = useState<'new' | 'existing'>('new');
  const [selectedPatient, setSelectedPatient] = useState<typeof existingPatients[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // New patient form state
  const [patientName, setPatientName] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [fileNumber, setFileNumber] = useState('');
  const [hospital, setHospital] = useState('');
  const [admissionDate, setAdmissionDate] = useState<Date | undefined>(undefined);
  const [specialty, setSpecialty] = useState('');
  const [provisionalDiagnosis, setProvisionalDiagnosis] = useState('');
  const [finalDiagnosis, setFinalDiagnosis] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [presentHistory, setPresentHistory] = useState('');
  const [pastMedicalHistory, setPastMedicalHistory] = useState('');
  const [allergies, setAllergies] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');
  const [hr, setHr] = useState('');
  const [spo2, setSpo2] = useState('');
  const [temp, setTemp] = useState('');
  const [rr, setRr] = useState('');
  const [bp, setBp] = useState('');
  const [weight, setWeight] = useState('');
  const [vitalDateTime, setVitalDateTime] = useState('');

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    patient: true,
    classification: true,
    history: false,
    vitals: false,
    investigations: false,
    management: false,
    progressNote: false,
    medications: false,
    respiratory: false,
    feeding: false,
  });

  const [medications, setMedications] = useState('');
  const [respiratorySupport, setRespiratorySupport] = useState('');
  const [respiratoryType, setRespiratoryType] = useState('');
  const [feeding, setFeeding] = useState('');
  const [investigationName, setInvestigationName] = useState('');
  const [investigationType, setInvestigationType] = useState('');
  const [investigationDate, setInvestigationDate] = useState<Date | undefined>(undefined);
  const [investigationResult, setInvestigationResult] = useState('');
  const [progressNoteDate, setProgressNoteDate] = useState<Date | undefined>(undefined);
  const [progressNoteAssessment, setProgressNoteAssessment] = useState('');

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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

        {/* ═══ Patient Information ═══ */}
        <CollapsibleSection
          title="Patient Information"
          icon={<ClipboardList size={18} className="text-primary" />}
          isExpanded={expandedSections.patient}
          onToggle={() => toggleSection('patient')}
        >
          <div className="space-y-4 pt-3">
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
              <div className="bg-muted/30 border border-border rounded-xl overflow-hidden">
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
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className={labelClass} style={{ color: '#6B7C93' }}>Full Name (English) <span className="text-destructive">*</span></label>
                  <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Patient's full name in English" className={inputClass} />
                </div>

                <div className="space-y-1.5">
                  <label className={labelClass} style={{ color: '#6B7C93' }}>Date of Birth <span className="text-destructive">*</span></label>
                  <div className="grid grid-cols-3 gap-3">
                    <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2} value={dobDay} onChange={(e) => setDobDay(e.target.value.replace(/\D/g, ''))} placeholder="DD" className={cn(inputClass, 'text-center')} />
                    <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2} value={dobMonth} onChange={(e) => setDobMonth(e.target.value.replace(/\D/g, ''))} placeholder="MM" className={cn(inputClass, 'text-center')} />
                    <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={4} value={dobYear} onChange={(e) => setDobYear(e.target.value.replace(/\D/g, ''))} placeholder="YYYY" className={cn(inputClass, 'text-center')} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={labelClass} style={{ color: '#6B7C93' }}>Gender <span className="text-destructive">*</span></label>
                  <div className="flex gap-3">
                    {(['male', 'female'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={cn(
                          'flex-1 h-11 rounded-[12px] text-[14px] font-medium border-[1.5px] transition-colors',
                          gender === g
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-white text-muted-foreground border-[hsl(216,20%,90%)] hover:bg-muted/50'
                        )}
                      >
                        {g === 'male' ? '♂ Male' : '♀ Female'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className={labelClass} style={{ color: '#6B7C93' }}>File Number</label>
                    <input type="text" value={fileNumber} onChange={(e) => setFileNumber(e.target.value)} placeholder="e.g. 24-10842" className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass} style={{ color: '#6B7C93' }}>Hospital <span className="text-destructive">*</span></label>
                    <Select value={hospital} onValueChange={setHospital}>
                      <SelectTrigger className="w-full h-11 bg-[hsl(210,40%,98%)] border-[1.5px] border-[hsl(216,20%,90%)] rounded-[12px] text-[14px] focus:border-primary">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {hospitals.map((h) => (
                          <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={labelClass} style={{ color: '#6B7C93' }}>Admission Date <span className="text-destructive">*</span></label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left text-[14px] h-11 bg-[hsl(210,40%,98%)] border-[1.5px] border-[hsl(216,20%,90%)] rounded-[12px] hover:border-primary">
                        <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                        {admissionDate ? format(admissionDate, 'MM/dd/yyyy') : <span className="text-muted-foreground">mm/dd/yyyy</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarPicker mode="single" selected={admissionDate} onSelect={setAdmissionDate} initialFocus className={cn('p-3 pointer-events-auto')} />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* ═══ Initial Classification ═══ */}
        <CollapsibleSection
          title="Classification"
          icon={<Stethoscope size={18} className="text-primary" />}
          isExpanded={expandedSections.classification}
          onToggle={() => toggleSection('classification')}
        >
          <div className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <label className={labelClass} style={{ color: '#6B7C93' }}>Specialty <span className="text-destructive">*</span></label>
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger className="w-full h-11 bg-[hsl(210,40%,98%)] border-[1.5px] border-[hsl(216,20%,90%)] rounded-[12px] text-[14px] focus:border-primary">
                  <SelectValue placeholder="Select specialty..." />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass} style={{ color: '#6B7C93' }}>Provisional Diagnosis</label>
              <textarea value={provisionalDiagnosis} onChange={(e) => setProvisionalDiagnosis(e.target.value)} placeholder="Enter working diagnosis..." rows={3} className={cn(inputClass, 'h-auto py-3 resize-none')} />
            </div>

            <div className="space-y-1.5">
              <label className={labelClass} style={{ color: '#6B7C93' }}>Final Diagnosis</label>
              <textarea value={finalDiagnosis} onChange={(e) => setFinalDiagnosis(e.target.value)} placeholder="Enter final diagnosis..." rows={3} className={cn(inputClass, 'h-auto py-3 resize-none')} />
            </div>
          </div>
        </CollapsibleSection>

        {/* ═══ Patient History ═══ */}
        <CollapsibleSection
          title="Patient History"
          icon={<ScrollText size={18} className="text-primary" />}
          isExpanded={expandedSections.history}
          onToggle={() => toggleSection('history')}
        >
          <div className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <label className={labelClass} style={{ color: '#6B7C93' }}>Chief Complaint</label>
              <textarea value={chiefComplaint} onChange={(e) => setChiefComplaint(e.target.value)} placeholder="High-grade fever and cough..." rows={3} className={cn(inputClass, 'h-auto py-3 resize-none')} />
            </div>

            <div className="space-y-1.5">
              <label className={labelClass} style={{ color: '#6B7C93' }}>Present History</label>
              <textarea value={presentHistory} onChange={(e) => setPresentHistory(e.target.value)} placeholder="History of present illness..." rows={3} className={cn(inputClass, 'h-auto py-3 resize-none')} />
            </div>

            <div className="space-y-1.5">
              <label className={labelClass} style={{ color: '#6B7C93' }}>Past Medical History</label>
              <textarea value={pastMedicalHistory} onChange={(e) => setPastMedicalHistory(e.target.value)} placeholder="No significant PMH..." rows={3} className={cn(inputClass, 'h-auto py-3 resize-none')} />
            </div>

            <div className="space-y-1.5">
              <label className={labelClass} style={{ color: '#6B7C93' }}>Allergies</label>
              <input type="text" value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="Penicillin — Rash" className={cn(inputClass, 'h-12')} />
            </div>

            <div className="space-y-1.5">
              <label className={labelClass} style={{ color: '#6B7C93' }}>Current Medications (Pre-Admission)</label>
              <textarea value={currentMedications} onChange={(e) => setCurrentMedications(e.target.value)} placeholder="List current medications..." rows={3} className={cn(inputClass, 'h-auto py-3 resize-none')} />
            </div>
          </div>
        </CollapsibleSection>

        {/* ═══ Add Vital Signs ═══ */}
        <CollapsibleSection
          title="Vital Signs"
          icon={<Activity size={18} className="text-primary" />}
          isExpanded={expandedSections.vitals}
          onToggle={() => toggleSection('vitals')}
          rightLabel="Today · Now"
        >
          <div className="space-y-4 pt-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className={labelClass} style={{ color: '#6B7C93' }}>HR (BPM)</label>
                <input type="text" inputMode="numeric" pattern="[0-9]*" value={hr} onChange={(e) => setHr(e.target.value.replace(/\D/g, ''))} placeholder="128" className={cn(inputClass, 'h-12')} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass} style={{ color: '#6B7C93' }}>SPO₂ (%)</label>
                <input type="text" inputMode="numeric" pattern="[0-9]*" value={spo2} onChange={(e) => setSpo2(e.target.value.replace(/\D/g, ''))} placeholder="94" className={cn(inputClass, 'h-12')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className={labelClass} style={{ color: '#6B7C93' }}>Temp (°C)</label>
                <input type="text" inputMode="decimal" value={temp} onChange={(e) => setTemp(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="38.6" className={cn(inputClass, 'h-12')} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass} style={{ color: '#6B7C93' }}>RR (/Min)</label>
                <input type="text" inputMode="numeric" pattern="[0-9]*" value={rr} onChange={(e) => setRr(e.target.value.replace(/\D/g, ''))} placeholder="46" className={cn(inputClass, 'h-12')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className={labelClass} style={{ color: '#6B7C93' }}>BP (mmHg)</label>
                <input type="text" inputMode="numeric" value={bp} onChange={(e) => setBp(e.target.value.replace(/[^0-9/]/g, ''))} placeholder="88/55" className={cn(inputClass, 'h-12')} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass} style={{ color: '#6B7C93' }}>Weight (kg)</label>
                <input type="text" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="13.2" className={cn(inputClass, 'h-12')} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass} style={{ color: '#6B7C93' }}>Date & Time</label>
              <input type="datetime-local" value={vitalDateTime} onChange={(e) => setVitalDateTime(e.target.value)} className={cn(inputClass, 'h-12')} />
            </div>
          </div>
        </CollapsibleSection>

        {/* ═══ Investigations ═══ */}
        <CollapsibleSection
          title="Investigations"
          icon={<span className="text-[18px]">🔬</span>}
          isExpanded={expandedSections.investigations}
          onToggle={() => toggleSection('investigations')}
        >
          <div className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <label className={labelClass} style={{ color: '#6B7C93' }}>Investigation Name</label>
              <input type="text" value={investigationName} onChange={(e) => setInvestigationName(e.target.value)} placeholder="e.g. CBC, Chest X-Ray..." className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className={labelClass} style={{ color: '#6B7C93' }}>Type</label>
                <Select value={investigationType} onValueChange={setInvestigationType}>
                  <SelectTrigger className="w-full h-11 bg-[hsl(210,40%,98%)] border-[1.5px] border-[hsl(216,20%,90%)] rounded-[12px] text-[14px] focus:border-primary">
                    <SelectValue placeholder="Lab Result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lab">Lab Result</SelectItem>
                    <SelectItem value="imaging">Imaging</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className={labelClass} style={{ color: '#6B7C93' }}>Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left text-[14px] h-11 bg-[hsl(210,40%,98%)] border-[1.5px] border-[hsl(216,20%,90%)] rounded-[12px] hover:border-primary">
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {investigationDate ? format(investigationDate, 'MM/dd/yyyy') : <span className="text-muted-foreground">mm/dd/yyyy</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarPicker mode="single" selected={investigationDate} onSelect={setInvestigationDate} initialFocus className={cn('p-3 pointer-events-auto')} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass} style={{ color: '#6B7C93' }}>Result (Text)</label>
              <textarea value={investigationResult} onChange={(e) => setInvestigationResult(e.target.value)} placeholder="Enter findings or numeric results..." rows={3} className={cn(inputClass, 'h-auto py-3 resize-none')} />
            </div>

            <button
              onClick={() => console.log('attach investigation image')}
              className="w-full h-20 border-2 border-dashed border-[hsl(216,20%,90%)] rounded-[12px] bg-[hsl(210,40%,98%)] flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <Upload size={20} />
              <span className="text-[11px] font-medium mt-1">Tap to attach image (Lab sheet / Imaging)</span>
            </button>
          </div>
        </CollapsibleSection>

        {/* ═══ Management ═══ */}
        <CollapsibleSection
          title="Management"
          icon={<span className="text-[18px]">⚕️</span>}
          isExpanded={expandedSections.management}
          onToggle={() => toggleSection('management')}
        >
          <div className="space-y-2 pt-2">
            {/* Nested: Medications */}
            <div className="rounded-[14px] border border-[hsl(216,20%,90%)] bg-[hsl(210,40%,98%)] overflow-hidden">
              <button
                onClick={() => toggleSection('medications')}
                className="w-full px-3 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[16px]">💊</span>
                  <span className="text-[15px] font-bold" style={{ color: '#1A2332' }}>Medications</span>
                </div>
                <ChevronDown
                  size={16}
                  style={{ color: '#6B7C93' }}
                  className={cn('transition-transform duration-300', expandedSections.medications && 'rotate-180')}
                />
              </button>
              <div className={cn(
                'overflow-hidden transition-all duration-300 ease-in-out',
                expandedSections.medications ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
              )}>
                <div className="px-3 pb-3 pt-1 border-t border-[hsl(216,20%,90%)]">
                  <div className="space-y-1.5">
                    <label className={labelClass} style={{ color: '#6B7C93' }}>Current Medications</label>
                    <textarea value={medications} onChange={(e) => setMedications(e.target.value)} placeholder="List medications, doses, and routes..." rows={3} className={cn(inputClass, 'h-auto py-3 resize-none')} />
                  </div>
                </div>
              </div>
            </div>

            {/* Nested: Respiratory Support */}
            <div className="rounded-[14px] border border-[hsl(216,20%,90%)] bg-[hsl(210,40%,98%)] overflow-hidden">
              <button
                onClick={() => toggleSection('respiratory')}
                className="w-full px-3 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <AirVent size={16} className="text-primary" />
                  <span className="text-[15px] font-bold" style={{ color: '#1A2332' }}>Respiratory Support</span>
                </div>
                <ChevronDown
                  size={16}
                  style={{ color: '#6B7C93' }}
                  className={cn('transition-transform duration-300', expandedSections.respiratory && 'rotate-180')}
                />
              </button>
              <div className={cn(
                'overflow-hidden transition-all duration-300 ease-in-out',
                expandedSections.respiratory ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
              )}>
                <div className="px-3 pb-3 pt-1 border-t border-[hsl(216,20%,90%)]">
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className={labelClass} style={{ color: '#6B7C93' }}>Type</label>
                      <div className="grid grid-cols-3 gap-2">
                        {([
                          { value: 'room-air', label: 'Room Air', icon: <span>💨</span> },
                          { value: 'nasal-o2', label: 'Nasal O₂', icon: <span>👃</span> },
                          { value: 'mask', label: 'Mask', icon: <span>😷</span> },
                          { value: 'hfnc', label: 'HFNC', icon: <span>🌬️</span> },
                          { value: 'cpap', label: 'CPAP', icon: <span>⚙️</span> },
                          { value: 'mv', label: 'MV', icon: <AirVent size={14} /> },
                        ] as const).map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setRespiratoryType(opt.value)}
                            className={cn(
                              'h-11 rounded-[12px] text-[13px] font-medium border-[1.5px] transition-colors flex items-center justify-center gap-1.5',
                              respiratoryType === opt.value
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-[hsl(210,40%,98%)] text-muted-foreground border-[hsl(216,20%,90%)] hover:bg-muted/50'
                            )}
                          >
                            {opt.icon} {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass} style={{ color: '#6B7C93' }}>Details</label>
                      <textarea value={respiratorySupport} onChange={(e) => setRespiratorySupport(e.target.value)} placeholder="Mode, FiO₂, settings..." rows={3} className={cn(inputClass, 'h-auto py-3 resize-none')} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Nested: Feeding */}
            <div className="rounded-[14px] border border-[hsl(216,20%,90%)] bg-[hsl(210,40%,98%)] overflow-hidden">
              <button
                onClick={() => toggleSection('feeding')}
                className="w-full px-3 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[16px]">🍼</span>
                  <span className="text-[15px] font-bold" style={{ color: '#1A2332' }}>Feeding</span>
                </div>
                <ChevronDown
                  size={16}
                  style={{ color: '#6B7C93' }}
                  className={cn('transition-transform duration-300', expandedSections.feeding && 'rotate-180')}
                />
              </button>
              <div className={cn(
                'overflow-hidden transition-all duration-300 ease-in-out',
                expandedSections.feeding ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
              )}>
                <div className="px-3 pb-3 pt-1 border-t border-[hsl(216,20%,90%)]">
                  <div className="space-y-1.5">
                    <label className={labelClass} style={{ color: '#6B7C93' }}>Feeding Details</label>
                    <textarea value={feeding} onChange={(e) => setFeeding(e.target.value)} placeholder="Type, volume, frequency..." rows={3} className={cn(inputClass, 'h-auto py-3 resize-none')} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* ═══ Progress Note ═══ */}
        <CollapsibleSection
          title="Progress Note"
          icon={<span className="text-[18px]">📝</span>}
          isExpanded={expandedSections.progressNote}
          onToggle={() => toggleSection('progressNote')}
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className={labelClass} style={{ color: '#6B7C93' }}>Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button className={cn(inputClass, 'flex items-center justify-between text-left', !progressNoteDate && 'text-muted-foreground')}>
                    {progressNoteDate ? format(progressNoteDate, 'MM/dd/yyyy') : 'mm/dd/yyyy'}
                    <CalendarIcon size={16} className="text-muted-foreground" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarPicker mode="single" selected={progressNoteDate} onSelect={setProgressNoteDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass} style={{ color: '#6B7C93' }}>Assessment</label>
              <textarea
                value={progressNoteAssessment}
                onChange={(e) => setProgressNoteAssessment(e.target.value)}
                placeholder="Clinical assessment..."
                rows={3}
                className={cn(inputClass, 'h-auto py-3 resize-none')}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* ═══ Attach Images ═══ */}
        <div className="bg-card border border-border rounded-[18px] p-4">
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
