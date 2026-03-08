import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Mock pre-filled data (will come from DB)
const mockPatient = {
  patientId: '1',
  name: 'Lucas Miller',
  dob: new Date('2018-03-12'),
  gender: 'male' as 'male' | 'female',
  notes: 'No known allergies. Vaccinations up to date.',
  notes: 'No known allergies. Vaccinations up to date.',
};

const EditPatientScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [name, setName] = useState(mockPatient.name);
  const [dob, setDob] = useState<Date | undefined>(mockPatient.dob);
  const [gender, setGender] = useState<'male' | 'female'>(mockPatient.gender);
  const [notes, setNotes] = useState(mockPatient.notes);

  const handleSave = () => {
    console.log('save patient', { id, name, dob, gender, notes });
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
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-foreground">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-11 px-4 bg-card border border-border rounded-xl text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Date of Birth */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-foreground">Date of Birth</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left text-[14px] h-11 bg-card border-border rounded-xl"
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                {dob ? format(dob, 'PPP') : <span className="text-muted-foreground">Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dob}
                onSelect={setDob}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Gender */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-foreground">Gender</label>
          <div className="flex gap-3">
            {(['male', 'female'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={cn(
                  "flex-1 h-11 rounded-xl text-[14px] font-medium border transition-colors",
                  gender === g
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:bg-muted/50"
                )}
              >
                {g === 'male' ? '♂ Male' : '♀ Female'}
              </button>
            ))}
          </div>
        </div>

        {/* Blood Type */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-foreground">Blood Type <span className="text-muted-foreground font-normal">(optional)</span></label>
          <input
            type="text"
            value={bloodType}
            onChange={(e) => setBloodType(e.target.value)}
            placeholder="e.g. A+, B-, O+"
            className="w-full h-11 px-4 bg-card border border-border rounded-xl text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Phone Number */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-foreground">Phone Number <span className="text-muted-foreground font-normal">(optional)</span></label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 555-0000"
            className="w-full h-11 px-4 bg-card border border-border rounded-xl text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-foreground">Notes <span className="text-muted-foreground font-normal">(optional)</span></label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes..."
            rows={3}
            className="w-full px-4 py-3 bg-card border border-border rounded-xl text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
          />
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={!name.trim()}
          className="w-full h-12 rounded-xl text-[15px] font-semibold"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default EditPatientScreen;
