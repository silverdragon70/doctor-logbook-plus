import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePatient, useUpdatePatient } from '@/hooks/usePatients';
import { useHospitals } from '@/hooks/useHospitals';

const inputClass =
  'w-full h-11 px-4 rounded-[12px] text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors'
    + ' bg-[hsl(210,40%,98%)] border-[1.5px] border-[hsl(216,20%,90%)] focus:border-primary';

const labelClass = 'text-[12px] font-bold uppercase tracking-wide';

const EditPatientScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = usePatient(id!);
  const { data: hospitals = [] } = useHospitals();
  const updatePatient = useUpdatePatient();

  const patient = data?.patient;

  const [name, setName] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [fileNumber, setFileNumber] = useState('');
  const [hospital, setHospital] = useState('');
  const [admissionDate, setAdmissionDate] = useState<Date | undefined>(undefined);

  // Populate form when patient data loads
  useEffect(() => {
    if (patient) {
      setName(patient.name ?? '');
      setDobDay(patient.dobDay ?? '');
      setDobMonth(patient.dobMonth ?? '');
      setDobYear(patient.dobYear ?? '');
      setGender(patient.gender ?? 'male');
      setFileNumber(patient.fileNumber ?? '');
    }
  }, [patient]);

  const handleSave = async () => {
    if (!id) return;
    try {
      await updatePatient.mutateAsync({
        id,
        data: { name, dobDay, dobMonth, dobYear, gender, fileNumber: fileNumber || undefined },
      });
      navigate(-1);
    } catch (e) {
      console.error('Failed to update patient', e);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

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
            <label className={labelClass} style={{ color: '#6B7C93' }}>Hospital</label>
            <Select value={hospital} onValueChange={setHospital}>
              <SelectTrigger className="w-full h-11 bg-[hsl(210,40%,98%)] border-[1.5px] border-[hsl(216,20%,90%)] rounded-[12px] text-[14px] focus:border-primary">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {hospitals.map((h) => (
                  <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
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
          disabled={!name.trim() || !dobDay || !dobMonth || !dobYear || !gender || updatePatient.isPending}
          className="w-full h-12 rounded-[12px] text-[15px] font-semibold"
        >
          {updatePatient.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default EditPatientScreen;
