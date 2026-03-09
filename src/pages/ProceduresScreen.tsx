import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Stethoscope, X, ChevronDown, CalendarIcon, Pencil, Trash2, Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import ExportSheet from '@/components/ExportSheet';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useProcedures, useProcedureStats, useCreateProcedure, useUpdateProcedure, useDeleteProcedure } from '@/hooks/useProcedures';
import { useHospitals } from '@/hooks/useHospitals';
import { usePatients } from '@/hooks/usePatients';
import type { Procedure } from '@/services/procedureService';

type ParticipationType = 'Performed' | 'Assisted' | 'Observed';
type FilterType = 'All' | ParticipationType;

const CORE_PROCEDURES = [
  'Bag-Mask Ventilation', 'Bladder Catheterization', 'Incision & Drainage of Abscess',
  'Lumbar Puncture (LP)', 'Neonatal Endotracheal Intubation', 'Peripheral IV Catheter Placement',
  'Umbilical Catheter Placement', 'Venipuncture',
];
const ADVANCED_PROCEDURES = [
  'ABG Sampling', 'Chest Tube Placement', 'Endotracheal Intubation (Non-Neonatal)', 'Thoracentesis',
];
const DAILY_PRACTICE = [
  'Nasogastric Tube (NGT) Insertion', 'Intraosseous (IO) Access', 'Suprapubic Aspiration',
  'Wound Suturing', 'Blood Culture Collection', 'Bone Marrow Aspiration',
];
const ALL_PROCEDURES = [
  { group: 'Core Procedures', items: CORE_PROCEDURES },
  { group: 'Advanced Procedures', items: ADVANCED_PROCEDURES },
  { group: 'Daily Practice', items: DAILY_PRACTICE },
];

const participationStyles: Record<ParticipationType, { bg: string; text: string }> = {
  Performed: { bg: 'bg-[#DCFCE7]', text: 'text-[#16A34A]' },
  Assisted:  { bg: 'bg-[#FEF9C3]', text: 'text-[#CA8A04]' },
  Observed:  { bg: 'bg-[#DBEAFE]', text: 'text-[#2563EB]' },
};

// ─── Procedure Search Dropdown ─────────────────────────
const ProcedureSearchDropdown = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return ALL_PROCEDURES;
    const q = query.toLowerCase();
    return ALL_PROCEDURES.map(g => ({ group: g.group, items: g.items.filter(i => i.toLowerCase().includes(q)) })).filter(g => g.items.length > 0);
  }, [query]);

  const exactMatch = ALL_PROCEDURES.some(g => g.items.some(i => i.toLowerCase() === query.trim().toLowerCase()));

  return (
    <div ref={ref} className="relative">
      <Input placeholder="Search or type procedure name..." value={query} onChange={e => { setQuery(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} className="bg-card border-border" />
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-xl shadow-elevated max-h-60 overflow-auto">
          {filtered.map(g => (
            <div key={g.group}>
              <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{g.group}</div>
              {g.items.map(item => (
                <button key={item} type="button" className="w-full text-left px-3 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors" onClick={() => { onChange(item); setQuery(item); setOpen(false); }}>{item}</button>
              ))}
            </div>
          ))}
          {query.trim() && !exactMatch && (
            <button type="button" className="w-full text-left px-3 py-2.5 text-sm text-primary font-medium hover:bg-muted/50 transition-colors border-t border-border" onClick={() => { onChange(query.trim()); setOpen(false); }}>
              + Add "{query.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Hospital Search Dropdown ─────────────────────────
const HospitalSearchDropdown = ({ value, onChange, hospitals }: { value: string; onChange: (v: string) => void; hospitals: string[] }) => {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return hospitals;
    const q = query.toLowerCase();
    return hospitals.filter(h => h.toLowerCase().includes(q));
  }, [query, hospitals]);

  return (
    <div ref={ref} className="relative">
      <Input placeholder="Search or add hospital..." value={query} onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} className="bg-card border-border" />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-xl shadow-elevated max-h-48 overflow-auto">
          {filtered.map(h => (
            <button key={h} type="button" className="w-full text-left px-3 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors" onClick={() => { onChange(h); setQuery(h); setOpen(false); }}>{h}</button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Patient Search Dropdown ─────────────────────────
const PatientSearchDropdown = ({ value, onChange, patients }: { value: string; onChange: (v: string) => void; patients: { id: string; name: string }[] }) => {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return patients;
    const q = query.toLowerCase();
    return patients.filter(p => p.name.toLowerCase().includes(q));
  }, [query, patients]);

  return (
    <div ref={ref} className="relative">
      <Input placeholder="Search or type patient name..." value={query} onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} className="bg-card border-border" />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-xl shadow-elevated max-h-48 overflow-auto">
          {filtered.map(p => (
            <button key={p.id} type="button" className="w-full text-left px-3 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors" onClick={() => { onChange(p.name); setQuery(p.name); setOpen(false); }}>{p.name}</button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Screen ────────────────────────────────────────
const ProceduresScreen = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('All');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);

  // Real data hooks
  const filterParam = filter !== 'All' ? { participation: filter as ParticipationType } : undefined;
  const { data: procedures = [], isLoading } = useProcedures(filterParam);
  const { data: stats } = useProcedureStats();
  const { data: hospitalList = [] } = useHospitals();
  const { data: patientList = [] } = usePatients();
  const createProcedure = useCreateProcedure();
  const updateProcedure = useUpdateProcedure();
  const deleteProcedure = useDeleteProcedure();

  const hospitalNames = hospitalList.map(h => h.name);
  const patients = patientList.map(p => ({ id: p.patientId, name: p.name }));

  useEffect(() => {
    const handler = () => setShowExport(true);
    window.addEventListener('open-export-sheet', handler);
    return () => window.removeEventListener('open-export-sheet', handler);
  }, []);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDate, setFormDate] = useState<Date>(new Date());
  const [formParticipation, setFormParticipation] = useState<ParticipationType>('Performed');
  const [formPatient, setFormPatient] = useState('');
  const [formHospital, setFormHospital] = useState('');
  const [formSupervisor, setFormSupervisor] = useState('');
  const [formIndication, setFormIndication] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const filters: FilterType[] = ['All', 'Performed', 'Assisted', 'Observed'];

  const resetForm = () => {
    setFormName(''); setFormDate(new Date()); setFormParticipation('Performed');
    setFormPatient(''); setFormHospital(''); setFormSupervisor(''); setFormIndication(''); setFormNotes('');
    setEditingId(null);
  };

  const handleEdit = (proc: Procedure) => {
    setEditingId(proc.id);
    setFormName(proc.name);
    setFormDate(new Date(proc.date));
    setFormParticipation(proc.participation);
    setFormPatient(proc.patientName || '');
    setFormHospital(proc.hospital || '');
    setFormSupervisor(proc.supervisor || '');
    setFormIndication(proc.indication || '');
    setFormNotes(proc.notes || '');
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      try { await deleteProcedure.mutateAsync(deleteId); } catch (e) { console.error(e); }
      setDeleteId(null);
    }
  };

  const handleSave = async () => {
    const payload = {
      name: formName,
      date: format(formDate, 'yyyy-MM-dd'),
      participation: formParticipation,
      patientName: formPatient || undefined,
      hospital: formHospital || undefined,
      supervisor: formSupervisor || undefined,
      indication: formIndication || undefined,
      notes: formNotes || undefined,
    };
    try {
      if (editingId) {
        await updateProcedure.mutateAsync({ id: editingId, data: payload });
      } else {
        await createProcedure.mutateAsync(payload);
      }
      resetForm();
      setShowForm(false);
    } catch (e) { console.error(e); }
  };

  const isSaving = createProcedure.isPending || updateProcedure.isPending;

  // ─── Add Procedure Form ───
  if (showForm) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => { resetForm(); setShowForm(false); }} className="p-1.5 -ml-1.5 rounded-xl hover:bg-muted/50 transition-colors">
            <X size={22} className="text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">{editingId ? 'Edit Procedure' : 'Add Procedure'}</h1>
        </div>

        <div className="px-5 py-5 space-y-5 max-w-[430px] mx-auto pb-10">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Procedure Name</label>
            <ProcedureSearchDropdown value={formName} onChange={setFormName} />
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
            <label className="text-sm font-medium text-foreground">Participation Type</label>
            <div className="flex gap-2">
              {(['Performed', 'Assisted', 'Observed'] as ParticipationType[]).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormParticipation(type)}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                    formParticipation === type
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card border border-border text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Patient <span className="text-muted-foreground font-normal">(optional)</span></label>
            <PatientSearchDropdown value={formPatient} onChange={setFormPatient} patients={patients} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Hospital <span className="text-muted-foreground font-normal">(optional)</span></label>
            <HospitalSearchDropdown value={formHospital} onChange={setFormHospital} hospitals={hospitalNames} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Supervisor <span className="text-muted-foreground font-normal">(optional)</span></label>
            <Input placeholder="e.g. Dr. Ahmad" value={formSupervisor} onChange={e => setFormSupervisor(e.target.value)} className="bg-card border-border" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Indication</label>
            <Input placeholder="Why was this procedure done?" value={formIndication} onChange={e => setFormIndication(e.target.value)} className="bg-card border-border" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Notes <span className="text-muted-foreground font-normal">(optional)</span></label>
            <Textarea placeholder="Any complications or observations..." value={formNotes} onChange={e => setFormNotes(e.target.value)} className="bg-card border-border min-h-[100px]" />
          </div>

          <Button onClick={handleSave} disabled={!formName.trim() || isSaving} className="w-full h-12 rounded-xl text-base font-semibold">
            {isSaving ? 'Saving...' : (editingId ? 'Update Procedure' : 'Save Procedure')}
          </Button>
        </div>
      </div>
    );
  }

  // ─── Main List View ───
  return (
    <>
      <div className="px-5 py-6 space-y-5 animate-fade-in pb-24">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          {([
            { label: 'Performed', value: stats?.performed ?? 0, type: 'Performed' as ParticipationType },
            { label: 'Assisted', value: stats?.assistant ?? 0, type: 'Assisted' as ParticipationType },
            { label: 'Observed', value: stats?.observed ?? 0, type: 'Observed' as ParticipationType },
          ]).map(s => (
            <div key={s.type} className={cn("rounded-2xl p-4 text-center", participationStyles[s.type].bg)}>
              <div className={cn("text-2xl font-bold font-mono-stats", participationStyles[s.type].text)}>{s.value}</div>
              <div className={cn("text-xs font-medium mt-0.5", participationStyles[s.type].text)}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-150",
                filter === f ? "bg-primary text-primary-foreground shadow-sm" : "bg-card text-muted-foreground border border-border hover:bg-muted/50"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Procedures List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-primary" size={28} />
          </div>
        ) : procedures.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
              <Stethoscope size={28} className="text-muted-foreground" />
            </div>
            {filter === 'All' ? (
              <>
                <p className="text-base font-semibold text-foreground">No procedures logged yet</p>
                <p className="text-sm text-muted-foreground mt-1">Tap + to add your first procedure</p>
              </>
            ) : (
              <p className="text-base font-semibold text-foreground">No {filter.toLowerCase()} procedures found</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {procedures.map(proc => (
              <div key={proc.id} className="bg-card rounded-2xl border border-border shadow-card p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground flex-1">{proc.name}</h3>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">{format(new Date(proc.date), 'dd MMM')}</span>
                    <span className={cn("text-[11px] font-semibold px-2.5 py-0.5 rounded-full", participationStyles[proc.participation].bg, participationStyles[proc.participation].text)}>
                      {proc.participation}
                    </span>
                  </div>
                </div>
                {(proc.patientName || proc.hospital) && (
                  <p className="text-xs text-muted-foreground">{[proc.patientName, proc.hospital].filter(Boolean).join(' · ')}</p>
                )}
                {proc.supervisor && <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground/70">Supervisor:</span> {proc.supervisor}</p>}
                {proc.indication && <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground/70">Indication:</span> {proc.indication}</p>}
                {proc.notes && <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground/70">Notes:</span> {proc.notes}</p>}
                <div className="flex gap-2 pt-1">
                  <button onClick={() => handleEdit(proc)} className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] transition-colors">
                    <Pencil size={12} /> Edit
                  </button>
                  <button onClick={() => setDeleteId(proc.id)} className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full bg-[#FEE2E2] text-[#DC2626] hover:bg-[#FECACA] transition-colors">
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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

      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-[84px] left-1/2 translate-x-[110px] w-14 h-14 bg-primary rounded-[18px] flex items-center justify-center text-primary-foreground shadow-brand active:scale-90 transition-all z-50 group overflow-hidden"
      >
        <Plus size={26} />
      </button>

      <ExportSheet
        open={showExport}
        onOpenChange={setShowExport}
        title="Procedures"
        data={procedures}
        dateKey="date"
        columns={[
          { header: 'Procedure Name', key: 'name' },
          { header: 'Date', key: 'date' },
          { header: 'Participation', key: 'participation' },
          { header: 'Patient', key: 'patientName' },
          { header: 'Hospital', key: 'hospital' },
          { header: 'Supervisor', key: 'supervisor' },
          { header: 'Indication', key: 'indication' },
          { header: 'Notes', key: 'notes' },
        ]}
      />
    </>
  );
};

export default ProceduresScreen;
