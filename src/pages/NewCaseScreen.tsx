import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Camera, User, Calendar, Search, X, CalendarIcon } from 'lucide-react';
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
  const [chiefComplaint, setChiefComplaint] = useState('');

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
        {/* Patient Selection Toggle */}
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
            <div className="space-y-4">
              {/* ROW 1 — Full Name (English) */}
              <div className="space-y-1.5">
                <label className={labelClass} style={{ color: '#6B7C93' }}>Full Name (English) <span className="text-destructive">*</span></label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Patient's full name in English"
                  className={inputClass}
                />
              </div>

              {/* ROW 2 — Date of Birth (3 numeric columns) */}
              <div className="space-y-1.5">
                <label className={labelClass} style={{ color: '#6B7C93' }}>Date of Birth <span className="text-destructive">*</span></label>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={2}
                    value={dobDay}
                    onChange={(e) => setDobDay(e.target.value.replace(/\D/g, ''))}
                    placeholder="DD"
                    className={cn(inputClass, 'text-center')}
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={2}
                    value={dobMonth}
                    onChange={(e) => setDobMonth(e.target.value.replace(/\D/g, ''))}
                    placeholder="MM"
                    className={cn(inputClass, 'text-center')}
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    value={dobYear}
                    onChange={(e) => setDobYear(e.target.value.replace(/\D/g, ''))}
                    placeholder="YYYY"
                    className={cn(inputClass, 'text-center')}
                  />
                </div>
              </div>

              {/* ROW 3 — Gender (pill buttons) */}
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

              {/* ROW 4 — File Number + Hospital (2 columns) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className={labelClass} style={{ color: '#6B7C93' }}>File Number</label>
                  <input
                    type="text"
                    value={fileNumber}
                    onChange={(e) => setFileNumber(e.target.value)}
                    placeholder="e.g. 24-10842"
                    className={inputClass}
                  />
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

              {/* ROW 5 — Admission Date */}
              <div className="space-y-1.5">
                <label className={labelClass} style={{ color: '#6B7C93' }}>Admission Date <span className="text-destructive">*</span></label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left text-[14px] h-11 bg-[hsl(210,40%,98%)] border-[1.5px] border-[hsl(216,20%,90%)] rounded-[12px] hover:border-primary"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {admissionDate ? format(admissionDate, 'MM/dd/yyyy') : <span className="text-muted-foreground">mm/dd/yyyy</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarPicker
                      mode="single"
                      selected={admissionDate}
                      onSelect={setAdmissionDate}
                      initialFocus
                      className={cn('p-3 pointer-events-auto')}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </div>

        {/* Initial Classification */}
        <div className="space-y-4">
          <h2 className="text-[17px] font-bold" style={{ color: '#1A2332' }}>Initial Classification</h2>

          {/* Specialty */}
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

          {/* Provisional Diagnosis */}
          <div className="space-y-1.5">
            <label className={labelClass} style={{ color: '#6B7C93' }}>Provisional Diagnosis</label>
            <textarea
              value={provisionalDiagnosis}
              onChange={(e) => setProvisionalDiagnosis(e.target.value)}
              placeholder="Enter working diagnosis..."
              rows={3}
              className={cn(inputClass, 'h-auto py-3 resize-none')}
            />
          </div>

          {/* Chief Complaint */}
          <div className="space-y-1.5">
            <label className={labelClass} style={{ color: '#6B7C93' }}>Chief Complaint</label>
            <textarea
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="Main presenting symptom..."
              rows={3}
              className={cn(inputClass, 'h-auto py-3 resize-none')}
            />
          </div>
        </div>

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
