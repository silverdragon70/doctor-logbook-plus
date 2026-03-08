import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, BookOpen, CalendarIcon, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import ExportSheet from '@/components/ExportSheet';

interface Lecture {
  id: string;
  topic: string;
  date: string;
  speaker?: string;
  duration?: string;
  location?: string;
  notes?: string;
}

const MOCK_LECTURES: Lecture[] = [
  { id: '1', topic: 'Neonatal Resuscitation Updates', date: '2026-03-08', speaker: 'Dr. Ahmad Al-Rashid', location: 'Main Auditorium', duration: '1 hour', notes: 'New NRP guidelines discussed' },
  { id: '2', topic: 'Pediatric Fluid Management', date: '2026-03-06', speaker: 'Dr. Sara Mohammed', location: 'Conference Room B', duration: '45 mins' },
  { id: '3', topic: 'Common Pediatric Emergencies', date: '2026-03-04', speaker: 'Dr. Khalid Hassan', location: 'Lecture Hall 2', duration: '1.5 hours' },
  { id: '4', topic: 'Antimicrobial Stewardship in NICU', date: '2026-03-02', speaker: 'Dr. Layla Nasser', duration: '1 hour', notes: 'Focus on empiric therapy' },
  { id: '5', topic: 'Growth Monitoring & Nutrition', date: '2026-02-28', location: 'Online - Zoom', duration: '30 mins' },
];

const LecturesScreen = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [lectures, setLectures] = useState<Lecture[]>(MOCK_LECTURES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    const handler = () => setShowExport(true);
    window.addEventListener('open-export-sheet', handler);
    return () => window.removeEventListener('open-export-sheet', handler);
  }, []);

  // Form state
  const [formTopic, setFormTopic] = useState('');
  const [formDate, setFormDate] = useState<Date>(new Date());
  const [formSpeaker, setFormSpeaker] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const resetForm = () => {
    setFormTopic(''); setFormDate(new Date()); setFormSpeaker('');
    setFormDuration(''); setFormLocation(''); setFormNotes('');
    setEditingId(null);
  };

  const handleEdit = (lec: Lecture) => {
    setEditingId(lec.id);
    setFormTopic(lec.topic);
    setFormDate(new Date(lec.date));
    setFormSpeaker(lec.speaker || '');
    setFormDuration(lec.duration || '');
    setFormLocation(lec.location || '');
    setFormNotes(lec.notes || '');
    setShowForm(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      setLectures(prev => prev.filter(l => l.id !== deleteId));
      setDeleteId(null);
    }
  };

  const handleSave = () => {
    if (editingId) {
      setLectures(prev => prev.map(l => l.id === editingId ? {
        ...l, topic: formTopic, date: format(formDate, 'yyyy-MM-dd'),
        speaker: formSpeaker || undefined, duration: formDuration || undefined,
        location: formLocation || undefined, notes: formNotes || undefined,
      } : l));
    } else {
      console.log('Save lecture', { formTopic, formDate, formSpeaker, formDuration, formLocation, formNotes });
    }
    resetForm();
    setShowForm(false);
  };

  // ─── Add/Edit Lecture Form ───
  if (showForm) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => { resetForm(); setShowForm(false); }} className="p-1.5 -ml-1.5 rounded-xl hover:bg-muted/50 transition-colors">
            <X size={22} className="text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">{editingId ? 'Edit Lecture' : 'Add Lecture'}</h1>
        </div>

        <div className="px-5 py-5 space-y-5 max-w-[430px] mx-auto pb-10">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Topic / Title</label>
            <Input placeholder="Lecture topic or title..." value={formTopic} onChange={e => setFormTopic(e.target.value)} className="bg-card border-border" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal bg-card border-border", !formDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formDate ? format(formDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={formDate} onSelect={(d) => d && setFormDate(d)} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Speaker / Lecturer <span className="text-muted-foreground font-normal">(optional)</span></label>
            <Input placeholder="Speaker or lecturer name..." value={formSpeaker} onChange={e => setFormSpeaker(e.target.value)} className="bg-card border-border" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Duration <span className="text-muted-foreground font-normal">(optional)</span></label>
            <Input placeholder="e.g. 1 hour, 45 mins..." value={formDuration} onChange={e => setFormDuration(e.target.value)} className="bg-card border-border" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Location <span className="text-muted-foreground font-normal">(optional)</span></label>
            <Input placeholder="Where was this lecture held?" value={formLocation} onChange={e => setFormLocation(e.target.value)} className="bg-card border-border" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Notes <span className="text-muted-foreground font-normal">(optional)</span></label>
            <Textarea placeholder="Any notes or takeaways..." value={formNotes} onChange={e => setFormNotes(e.target.value)} className="bg-card border-border min-h-[100px]" />
          </div>

          <Button onClick={handleSave} disabled={!formTopic.trim()} className="w-full h-12 rounded-xl text-base font-semibold">
            {editingId ? 'Update Lecture' : 'Save Lecture'}
          </Button>
        </div>
      </div>
    );
  }

  // ─── Main List View ───
  return (
    <>
      <div className="px-5 py-6 space-y-5 animate-fade-in pb-24">
        {/* Export Button */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowExport(true)}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-1.5 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB] hover:bg-[#DBEAFE] transition-colors"
          >
            <Upload size={14} /> Export
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-3">
          <div className="rounded-2xl p-4 text-center bg-[#DBEAFE]">
            <div className="text-2xl font-bold font-mono-stats text-[#2563EB]">{lectures.length}</div>
            <div className="text-xs font-medium mt-0.5 text-[#2563EB]">Attended</div>
          </div>
        </div>

        {/* List */}
        {lectures.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
              <BookOpen size={28} className="text-muted-foreground" />
            </div>
            <p className="text-base font-semibold text-foreground">No lectures logged yet</p>
            <p className="text-sm text-muted-foreground mt-1">Tap + to add your first lecture</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lectures.map(lec => (
              <div key={lec.id} className="bg-card rounded-2xl border border-border shadow-card p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground flex-1">{lec.topic}</h3>
                  <span className="text-xs text-muted-foreground shrink-0">{format(new Date(lec.date), 'dd MMM')}</span>
                </div>
                {lec.speaker && (
                  <p className="text-xs text-muted-foreground">🎤 {lec.speaker}</p>
                )}
                {(lec.location || lec.duration) && (
                  <p className="text-xs text-muted-foreground">
                    {[lec.location && `📍 ${lec.location}`, lec.duration && `⏱ ${lec.duration}`].filter(Boolean).join('  ·  ')}
                  </p>
                )}
                {lec.notes && (
                  <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground/70">Notes:</span> {lec.notes}</p>
                )}
                <div className="flex gap-2 pt-1">
                  <button onClick={() => handleEdit(lec)} className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] transition-colors">
                    <Pencil size={12} /> Edit
                  </button>
                  <button onClick={() => setDeleteId(lec.id)} className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full bg-[#FEE2E2] text-[#DC2626] hover:bg-[#FECACA] transition-colors">
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-[#DC2626] hover:bg-[#B91C1C] text-white">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* FAB */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-[84px] left-1/2 translate-x-[110px] w-14 h-14 bg-primary rounded-[18px] flex items-center justify-center text-primary-foreground shadow-brand active:scale-90 transition-all z-50 group overflow-hidden"
      >
        <Plus size={26} />
      </button>

      {/* Export Sheet */}
      <ExportSheet
        open={showExport}
        onOpenChange={setShowExport}
        title="Lectures"
        data={lectures}
        dateKey="date"
        columns={[
          { header: 'Topic / Title', key: 'topic' },
          { header: 'Date', key: 'date' },
          { header: 'Speaker', key: 'speaker' },
          { header: 'Duration', key: 'duration' },
          { header: 'Location', key: 'location' },
          { header: 'Notes', key: 'notes' },
        ]}
      />
    </>
  );
};

export default LecturesScreen;
