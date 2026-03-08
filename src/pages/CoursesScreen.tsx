import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, GraduationCap, CalendarIcon, Upload, FileText, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import ExportSheet from '@/components/ExportSheet';

interface Course {
  id: string;
  name: string;
  date: string;
  provider?: string;
  duration?: string;
  hasCertificate: boolean;
  certificateName?: string;
  notes?: string;
}

const MOCK_COURSES: Course[] = [
  { id: '1', name: 'Pediatric Advanced Life Support (PALS)', date: '2026-03-01', provider: 'American Heart Association', duration: '2 days', hasCertificate: true, certificateName: 'PALS_Certificate.pdf', notes: 'Renewal completed' },
  { id: '2', name: 'Neonatal Resuscitation Program (NRP)', date: '2026-02-15', provider: 'AAP', duration: '1 day', hasCertificate: true, certificateName: 'NRP_cert.jpg' },
  { id: '3', name: 'Point-of-Care Ultrasound Workshop', date: '2026-01-20', provider: 'King Fahad Medical City', duration: '3 days', hasCertificate: false, notes: 'Hands-on training with FAST exam' },
];

const CoursesScreen = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDate, setFormDate] = useState<Date>(new Date());
  const [formProvider, setFormProvider] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formCertFile, setFormCertFile] = useState<File | null>(null);
  const [formCertPreview, setFormCertPreview] = useState<string | null>(null);
  const [formNotes, setFormNotes] = useState('');

  const completedCount = courses.length;
  const certificateCount = courses.filter(c => c.hasCertificate).length;

  const resetForm = () => {
    setFormName(''); setFormDate(new Date()); setFormProvider('');
    setFormDuration(''); setFormCertFile(null); setFormCertPreview(null); setFormNotes('');
    setEditingId(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormCertFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setFormCertPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setFormCertPreview(null);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingId(course.id);
    setFormName(course.name);
    setFormDate(new Date(course.date));
    setFormProvider(course.provider || '');
    setFormDuration(course.duration || '');
    setFormNotes(course.notes || '');
    setFormCertFile(null);
    setFormCertPreview(null);
    setShowForm(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      setCourses(prev => prev.filter(c => c.id !== deleteId));
      setDeleteId(null);
    }
  };

  const handleSave = () => {
    if (editingId) {
      setCourses(prev => prev.map(c => c.id === editingId ? {
        ...c, name: formName, date: format(formDate, 'yyyy-MM-dd'),
        provider: formProvider || undefined, duration: formDuration || undefined,
        notes: formNotes || undefined,
        hasCertificate: formCertFile ? true : c.hasCertificate,
        certificateName: formCertFile ? formCertFile.name : c.certificateName,
      } : c));
    } else {
      console.log('Save course', { formName, formDate, formProvider, formDuration, formCertFile, formNotes });
    }
    resetForm();
    setShowForm(false);
  };

  // ─── Add/Edit Course Form ───
  if (showForm) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => { resetForm(); setShowForm(false); }} className="p-1.5 -ml-1.5 rounded-xl hover:bg-muted/50 transition-colors">
            <X size={22} className="text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">{editingId ? 'Edit Course' : 'Add Course'}</h1>
        </div>

        <div className="px-5 py-5 space-y-5 max-w-[430px] mx-auto pb-10">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Course Name</label>
            <Input placeholder="Course name..." value={formName} onChange={e => setFormName(e.target.value)} className="bg-card border-border" />
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
            <label className="text-sm font-medium text-foreground">Provider / Institution <span className="text-muted-foreground font-normal">(optional)</span></label>
            <Input placeholder="e.g. AAP, WHO, University..." value={formProvider} onChange={e => setFormProvider(e.target.value)} className="bg-card border-border" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Duration <span className="text-muted-foreground font-normal">(optional)</span></label>
            <Input placeholder="e.g. 2 days, 4 weeks..." value={formDuration} onChange={e => setFormDuration(e.target.value)} className="bg-card border-border" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Certificate <span className="text-muted-foreground font-normal">(optional)</span></label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            {formCertFile ? (
              <div className="flex items-center gap-3 bg-card border border-border rounded-xl p-3">
                {formCertPreview ? (
                  <img src={formCertPreview} alt="Certificate preview" className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center">
                    <FileText size={20} className="text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{formCertFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(formCertFile.size / 1024).toFixed(0)} KB</p>
                </div>
                <button onClick={() => { setFormCertFile(null); setFormCertPreview(null); }} className="p-1 rounded-lg hover:bg-muted/50">
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 bg-card border border-dashed border-border rounded-xl p-4 text-sm text-muted-foreground hover:bg-muted/30 transition-colors"
              >
                <Upload size={18} />
                Upload Certificate
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Notes <span className="text-muted-foreground font-normal">(optional)</span></label>
            <Textarea placeholder="Any notes about this course..." value={formNotes} onChange={e => setFormNotes(e.target.value)} className="bg-card border-border min-h-[100px]" />
          </div>

          <Button onClick={handleSave} disabled={!formName.trim()} className="w-full h-12 rounded-xl text-base font-semibold">
            {editingId ? 'Update Course' : 'Save Course'}
          </Button>
        </div>
      </div>
    );
  }

  // ─── Main List View ───
  return (
    <>
      <div className="px-5 py-6 space-y-5 animate-fade-in pb-24">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4 text-center bg-[#DCFCE7]">
            <div className="text-2xl font-bold font-mono-stats text-[#16A34A]">{completedCount}</div>
            <div className="text-xs font-medium mt-0.5 text-[#16A34A]">Completed</div>
          </div>
          <div className="rounded-2xl p-4 text-center bg-[#FEF3C7]">
            <div className="text-2xl font-bold font-mono-stats text-[#D97706]">{certificateCount}</div>
            <div className="text-xs font-medium mt-0.5 text-[#D97706]">Certificates</div>
          </div>
        </div>

        {/* List */}
        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
              <GraduationCap size={28} className="text-muted-foreground" />
            </div>
            <p className="text-base font-semibold text-foreground">No courses logged yet</p>
            <p className="text-sm text-muted-foreground mt-1">Tap + to add your first course</p>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map(course => (
              <div key={course.id} className="bg-card rounded-2xl border border-border shadow-card p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground flex-1">{course.name}</h3>
                  <span className="text-xs text-muted-foreground shrink-0">{format(new Date(course.date), 'dd MMM')}</span>
                </div>
                {course.provider && (
                  <p className="text-xs text-muted-foreground">🏛 {course.provider}</p>
                )}
                {course.duration && (
                  <p className="text-xs text-muted-foreground">⏱ {course.duration}</p>
                )}
                {course.hasCertificate && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706]">
                    📜 Certificate
                  </span>
                )}
                {course.notes && (
                  <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground/70">Notes:</span> {course.notes}</p>
                )}
                <div className="flex gap-2 pt-1">
                  <button onClick={() => handleEdit(course)} className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] transition-colors">
                    <Pencil size={12} /> Edit
                  </button>
                  <button onClick={() => setDeleteId(course.id)} className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full bg-[#FEE2E2] text-[#DC2626] hover:bg-[#FECACA] transition-colors">
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
    </>
  );
};

export default CoursesScreen;
