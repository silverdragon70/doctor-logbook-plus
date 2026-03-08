import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const mockPatient = {
  patientId: '1',
  name: 'Lucas Miller',
  dobDay: '12',
  dobMonth: '03',
  dobYear: '2018',
  gender: 'male' as 'male' | 'female',
  fileNumber: 'PED-2024-001',
  hospital: 'cairo-university',
  admissionDate: new Date('2025-01-15'),
};

const hospitals = [
  { value: 'cairo-university', label: 'Cairo University Hospital' },
  { value: 'ain-shams', label: 'Ain Shams University Hospital' },
  { value: 'kasr-alainy', label: 'Kasr Al-Ainy Hospital' },
];

const inputClass =
  'w-full h-11 px-4 rounded-[12px] text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors'
    + ' bg-[hsl(210,40%,98%)] border-[1.5px] border-[hsl(216,20%,90%)] focus:border-primary';

const labelClass = 'text-[12px] font-bold uppercase tracking-wide';

const EditPatientScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [name, setName] = useState(mockPatient.name);
  const [dobDay, setDobDay] = useState(mockPatient.dobDay);
  const [dobMonth, setDobMonth] = useState(mockPatient.dobMonth);
  const [dobYear, setDobYear] = useState(mockPatient.dobYear);
  const [gender, setGender] = useState<'male' | 'female'>(mockPatient.gender);
  const [fileNumber, setFileNumber] = useState(mockPatient.fileNumber);
  const [hospital, setHospital] = useState(mockPatient.hospital);
  const [admissionDate, setAdmissionDate] = useState<Date | undefined>(mockPatient.admissionDate);

  const handleSave = () => {
    console.log('save patient', { id, name, dobDay, dobMonth, dobYear, gender, fileNumber, hospital, admissionDate });
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <header className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-muted text-muted-foreground">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-[16px] font-bold text-foreground">Edit Patient</h1>
        <div className="w-9" />
      </header>

      <div className="px-5 py-5 space-y-5 pb-10">
        {/* ROW 1 — Full Name (English) */}
        <div className="space-y-1.5">
          <label className={labelClass} style={{ color: '#6B7C93' }}>Full Name (English) <span className="text-destructive">*</span></label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
              <Calendar
                mode="single"
                selected={admissionDate}
                onSelect={setAdmissionDate}
                initialFocus
                className={cn('p-3 pointer-events-auto')}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={!name.trim() || !dobDay || !dobMonth || !dobYear || !gender || !hospital || !admissionDate}
          className="w-full h-12 rounded-[12px] text-[15px] font-semibold"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default EditPatientScreen;
