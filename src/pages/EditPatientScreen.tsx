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
  notes: 'No known allergies. Vaccinations up to date.',
};

const hospitals = [
  { value: 'cairo-university', label: 'Cairo University Hospital' },
  { value: 'ain-shams', label: 'Ain Shams University Hospital' },
  { value: 'kasr-alainy', label: 'Kasr Al-Ainy Hospital' },
];

const EditPatientScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [name, setName] = useState(mockPatient.name);
  const [dobDay, setDobDay] = useState(mockPatient.dobDay);
  const [dobMonth, setDobMonth] = useState(mockPatient.dobMonth);
  const [dobYear, setDobYear] = useState(mockPatient.dobYear);
  const [gender, setGender] = useState<string>(mockPatient.gender);
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
          <label className="text-[13px] font-semibold text-foreground">Full Name (English) <span className="text-destructive">*</span></label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Patient's full name in English"
            className="w-full h-11 px-4 bg-card border border-border rounded-xl text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* ROW 2 — Date of Birth (3 columns) */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-foreground">Date of Birth <span className="text-destructive">*</span></label>
          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={2}
              value={dobDay}
              onChange={(e) => setDobDay(e.target.value.replace(/\D/g, ''))}
              placeholder="DD"
              className="w-full h-11 px-4 bg-card border border-border rounded-xl text-[14px] text-foreground text-center placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={2}
              value={dobMonth}
              onChange={(e) => setDobMonth(e.target.value.replace(/\D/g, ''))}
              placeholder="MM"
              className="w-full h-11 px-4 bg-card border border-border rounded-xl text-[14px] text-foreground text-center placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={dobYear}
              onChange={(e) => setDobYear(e.target.value.replace(/\D/g, ''))}
              placeholder="YYYY"
              className="w-full h-11 px-4 bg-card border border-border rounded-xl text-[14px] text-foreground text-center placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* ROW 3 — Gender */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-foreground">Gender <span className="text-destructive">*</span></label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger className="w-full h-11 bg-card border-border rounded-xl text-[14px]">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ROW 4 — File Number + Hospital (2 columns) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-foreground">File Number</label>
            <input
              type="text"
              value={fileNumber}
              onChange={(e) => setFileNumber(e.target.value)}
              placeholder="e.g. 24-10842"
              className="w-full h-11 px-4 bg-card border border-border rounded-xl text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-foreground">Hospital <span className="text-destructive">*</span></label>
            <Select value={hospital} onValueChange={setHospital}>
              <SelectTrigger className="w-full h-11 bg-card border-border rounded-xl text-[14px]">
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
          <label className="text-[13px] font-semibold text-foreground">Admission Date <span className="text-destructive">*</span></label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left text-[14px] h-11 bg-card border-border rounded-xl"
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
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={!name.trim() || !dobDay || !dobMonth || !dobYear || !gender || !hospital || !admissionDate}
          className="w-full h-12 rounded-xl text-[15px] font-semibold"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default EditPatientScreen;
