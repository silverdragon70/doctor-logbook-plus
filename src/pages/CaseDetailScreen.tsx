import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2, Camera, Image, ChevronDown, ChevronUp, Upload, Lightbulb, Pencil, Plus, LogOut, CalendarDays, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import ExportSheet from '@/components/ExportSheet';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import AddInvestigationSheet from '@/components/case-detail/AddInvestigationSheet';
import AddManagementSheet from '@/components/case-detail/AddManagementSheet';
import AddProgressNoteSheet from '@/components/case-detail/AddProgressNoteSheet';
import { useCase, useDischargeCase, useDeleteCase } from '@/hooks/useCases';
import { useCreateInvestigation, useUpdateInvestigation, useDeleteInvestigation } from '@/hooks/useInvestigations';
import { useCreateManagement, useUpdateManagement, useDeleteManagement } from '@/hooks/useManagement';
import { useCreateProgressNote, useUpdateProgressNote, useDeleteProgressNote } from '@/hooks/useProgressNotes';
import { useCaseMedia, useAddMedia, useDeleteMedia } from '@/hooks/useMedia';
import { usePatientCases } from '@/hooks/useCases';

const navPills = [
  { key: 'patientInfo', label: 'Info' },
  { key: 'classification', label: 'Class' },
  { key: 'history', label: 'History' },
  { key: 'investigations', label: 'Inv' },
  { key: 'management', label: 'Management' },
  { key: 'progress', label: 'Progress' },
];

const exportColumns = [
  { header: 'Field', key: 'field' },
  { header: 'Value', key: 'value' },
];

const DisplayField = ({ label, value, isMultiLine = false }: { label: string; value: string; isMultiLine?: boolean }) => (
  <div className="space-y-1.5">
    <span style={{ color: '#6B7C93', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}
    </span>
    <div
      className={isMultiLine ? 'min-h-[80px]' : ''}
      style={{
        background: '#F8FAFC',
        border: '1.5px solid #DDE3EA',
        borderRadius: '12px',
        padding: '12px 16px',
        color: '#1A2332',
        fontSize: '15px',
        lineHeight: '1.5',
      }}
    >
      {value || '—'}
    </div>
  </div>
);

const AccordionSection = ({
  icon, title, isExpanded, onToggle, children, sectionRef,
  onEdit, onAdd, isEditing,
}: {
  icon: string; title: string; isExpanded: boolean; onToggle: () => void;
  children: React.ReactNode; sectionRef?: React.RefObject<HTMLDivElement>;
  onEdit?: () => void; onAdd?: () => void; isEditing?: boolean;
}) => (
  <div
    ref={sectionRef}
    style={{
      background: '#FFFFFF', borderRadius: '18px', padding: '0',
      boxShadow: '0px 2px 8px rgba(0,0,0,0.06)', marginBottom: '16px', overflow: 'hidden',
    }}
  >
    <div className="flex items-center justify-between hover:bg-muted/30 transition-colors" style={{ padding: '16px' }}>
      <button onClick={onToggle} className="flex items-center gap-2 flex-1 text-left">
        <span style={{ fontSize: '16px' }}>{icon}</span>
        <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A2332' }}>{title}</span>
      </button>
      <div className="flex items-center gap-1">
        {onAdd && (
          <button onClick={(e) => { e.stopPropagation(); onAdd(); }} className="p-1.5 rounded-full hover:bg-muted/50 transition-colors">
            <Plus size={16} style={{ color: '#2563EB' }} />
          </button>
        )}
        {onEdit && (
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 rounded-full hover:bg-muted/50 transition-colors">
            <Pencil size={15} style={{ color: isEditing ? '#16A34A' : '#2563EB' }} />
          </button>
        )}
        <button onClick={onToggle} className="p-1.5">
          <ChevronDown size={18} className="text-muted-foreground transition-transform duration-300"
            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
        </button>
      </div>
    </div>
    <div className="transition-all duration-300 ease-in-out overflow-hidden"
      style={{ maxHeight: isExpanded ? '2000px' : '0', opacity: isExpanded ? 1 : 0 }}>
      <div style={{ padding: '0 16px 16px 16px' }} className="space-y-3">{children}</div>
    </div>
  </div>
);

const GenderPill = ({ gender }: { gender: 'male' | 'female' }) => (
  <div className="flex gap-2">
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 600,
        background: gender === 'male' ? '#2563EB' : '#EC4899',
        color: '#FFFFFF',
      }}
    >
      {gender === 'male' ? '♂' : '♀'} {gender === 'male' ? 'Male' : 'Female'}
    </span>
  </div>
);

const CaseDetailScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: caseData, isLoading } = useCase(id!);
  const { data: media = [] } = useCaseMedia(id!);
  const { data: patientCasesRaw = [] } = usePatientCases(caseData?.case.patientId ?? '');

  const { mutate: createInvestigation } = useCreateInvestigation();
  const { mutate: updateInvestigation } = useUpdateInvestigation();
  const { mutate: deleteInvestigation } = useDeleteInvestigation();

  const { mutate: createManagement } = useCreateManagement();
  const { mutate: updateManagement } = useUpdateManagement();
  const { mutate: deleteManagement } = useDeleteManagement();

  const { mutate: createProgressNote } = useCreateProgressNote();
  const { mutate: updateProgressNote } = useUpdateProgressNote();
  const { mutate: deleteProgressNote } = useDeleteProgressNote();

  const { mutate: dischargeCase } = useDischargeCase();
  const { mutate: deleteCase } = useDeleteCase();

  const { mutate: addMedia } = useAddMedia();
  const { mutate: deleteMedia } = useDeleteMedia();

  const [showExport, setShowExport] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activePill, setActivePill] = useState('patientInfo');
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [expandedSubs, setExpandedSubs] = useState<string[]>([]);
  const [editingSections, setEditingSections] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'inv' | 'mgmt' | 'prog'; id: string } | null>(null);
  const [showAddInvestigation, setShowAddInvestigation] = useState(false);
  const [showAddManagement, setShowAddManagement] = useState(false);
  const [showAddProgress, setShowAddProgress] = useState(false);
  const [editInvestigation, setEditInvestigation] = useState<any>(null);
  const [editManagement, setEditManagement] = useState<any>(null);
  const [editProgress, setEditProgress] = useState<any>(null);
  const [showDischargeDialog, setShowDischargeDialog] = useState(false);
  const [dischargeDate, setDischargeDate] = useState<Date>(new Date());
  const [dischargeNotes, setDischargeNotes] = useState('');
  const [dischargeOutcome, setDischargeOutcome] = useState<string | null>(null);
  const [outcomeDropdownOpen, setOutcomeDropdownOpen] = useState(false);

  const toggleEdit = (key: string) => {
    setEditingSections(prev => prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]);
  };

  const sectionRefs: Record<string, React.RefObject<HTMLDivElement>> = {
    patientInfo: useRef<HTMLDivElement>(null),
    classification: useRef<HTMLDivElement>(null),
    history: useRef<HTMLDivElement>(null),
    investigations: useRef<HTMLDivElement>(null),
    management: useRef<HTMLDivElement>(null),
    progress: useRef<HTMLDivElement>(null),
  };

  const toggleSection = (key: string) => {
    setExpandedSections(prev => prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]);
  };

  const toggleSub = (key: string) => {
    setExpandedSubs(prev => prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]);
  };

  const handlePillClick = useCallback((key: string) => {
    setExpandedSections(prev => prev.includes(key) ? prev : [...prev, key]);
    setActivePill(key);
    setTimeout(() => {
      const ref = sectionRefs[key];
      if (ref?.current) {
        const offset = 110;
        const top = ref.current.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }, 100);
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    navPills.forEach(({ key }) => {
      const ref = sectionRefs[key];
      if (ref?.current) {
        const observer = new IntersectionObserver(
          ([entry]) => { if (entry.isIntersecting) setActivePill(key); },
          { rootMargin: '-120px 0px -60% 0px', threshold: 0 }
        );
        observer.observe(ref.current);
        observers.push(observer);
      }
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  const handleDeleteCase = () => {
    deleteCase(id!, { onSuccess: () => navigate(-1) });
    setShowDeleteDialog(false);
  };

  const handleDeleteTarget = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'inv') {
      deleteInvestigation({ id: deleteTarget.id, caseId: id! });
    } else if (deleteTarget.type === 'mgmt') {
      deleteManagement({ id: deleteTarget.id, caseId: id! });
    } else if (deleteTarget.type === 'prog') {
      deleteProgressNote({ id: deleteTarget.id, caseId: id! });
    }
    setDeleteTarget(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && id) {
      addMedia({ caseId: id, file });
    }
  };

  const c = caseData?.case;
  const investigations = caseData?.investigations ?? [];
  const managementEntries = caseData?.management ?? [];
  const progressNotes = caseData?.progressNotes ?? [];

  const initials = c?.patientName
    ? c.patientName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  const exportData = [
    { field: 'Patient Name', value: c?.patientName ?? '', date: c?.date ?? '' },
    { field: 'Diagnosis', value: c?.provisionalDiagnosis ?? '', date: c?.date ?? '' },
    { field: 'Chief Complaint', value: c?.chiefComplaint ?? '', date: c?.date ?? '' },
  ];

  const patientCasesForExport = patientCasesRaw.map((pc: any) => ({
    id: pc.caseId,
    diagnosis: pc.provisionalDiagnosis ?? '',
    date: pc.admissionDate ?? pc.date ?? '',
    complaint: pc.chiefComplaint ?? '',
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!c) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Case not found.</p>
        <button onClick={() => navigate(-1)} className="text-primary font-semibold">Go Back</button>
      </div>
    );
  }

  const outcomes = [
    { key: 'cured', label: 'Cured / Recovered' },
    { key: 'followup', label: 'Follow Up Required' },
    { key: 'referred', label: 'Referred to Specialist' },
    { key: 'transferred', label: 'Transferred to Another Hospital' },
    { key: 'lama', label: 'Left Against Medical Advice (LAMA)' },
    { key: 'chronic', label: 'Chronic / Ongoing Management' },
    { key: 'homecare', label: 'Discharged with Home Care' },
    { key: 'died', label: 'Died' },
  ];

  const isDischargeValid = !!dischargeDate && !!dischargeOutcome;
  const isAlreadyDischarged = c.status === 'discharged';

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header */}
      <header className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-muted text-muted-foreground">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-[16px] font-bold text-foreground">Case Details</h1>
        <div className="flex gap-1">
          <button onClick={() => setShowExport(true)} className="p-2 rounded-full hover:bg-muted transition-colors" style={{ color: '#2563EB' }}>
            <Upload size={18} />
          </button>
          <button onClick={() => navigate(`/case/${id}/pearl`, { state: { caseData: c } })} className="p-2 rounded-full hover:bg-muted transition-colors" style={{ color: '#D97706' }}>
            <Lightbulb size={18} />
          </button>
          <button
            onClick={() => !isAlreadyDischarged && setShowDischargeDialog(true)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            style={{ color: isAlreadyDischarged ? '#94A3B8' : '#10B981', cursor: isAlreadyDischarged ? 'default' : 'pointer' }}
            disabled={isAlreadyDischarged}
          >
            <LogOut size={18} />
          </button>
          <button onClick={() => setShowDeleteDialog(true)} className="p-2 rounded-full hover:bg-muted text-destructive">
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      {/* Quick Navigation Bar */}
      <div className="sticky top-[52px] z-40 px-4 py-2.5 overflow-x-auto no-scrollbar flex gap-2" style={{ background: '#F0F4F8' }}>
        {navPills.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handlePillClick(key)}
            className="flex-shrink-0 text-[13px] font-semibold transition-colors"
            style={{
              padding: '8px 14px', borderRadius: '20px',
              background: activePill === key ? '#2563EB' : '#FFFFFF',
              color: activePill === key ? '#FFFFFF' : '#6B7C93',
              border: activePill === key ? 'none' : '1.5px solid #DDE3EA',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="px-5 py-5 pb-10">
        {/* Patient Info Card */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card" style={{ marginBottom: '16px' }}>
          <div className="h-1 w-full gradient-brand" />
          <div className="p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-avatar flex items-center justify-center text-primary-foreground font-bold text-[16px]">
              {initials}
            </div>
            <div className="flex-1">
              <h3 className="text-[16px] font-bold text-foreground">{c.patientName}</h3>
              <p className="text-[12px] text-muted-foreground">{c.patientAge}y • {c.patientGender} • {c.date}</p>
            </div>
            <div className="px-2.5 py-1 bg-accent rounded-full text-[10px] font-bold text-accent-foreground">
              {c.mediaCount} 📷
            </div>
          </div>
        </div>

        {/* SECTION 1 — Patient Information */}
        <AccordionSection
          icon="📋" title="Patient Information"
          isExpanded={expandedSections.includes('patientInfo')}
          onToggle={() => toggleSection('patientInfo')}
          sectionRef={sectionRefs.patientInfo}
          onEdit={() => toggleEdit('patientInfo')}
          isEditing={editingSections.includes('patientInfo')}
        >
          <DisplayField label="Full Name (English)" value={c.patientName} />
          <div className="space-y-1.5">
            <span style={{ color: '#6B7C93', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Date of Birth
            </span>
            <div className="flex gap-2">
              {[c.dob.day, c.dob.month, c.dob.year].map((v, i) => (
                <div key={i} style={{
                  background: '#F8FAFC', border: '1.5px solid #DDE3EA', borderRadius: '12px',
                  padding: '12px 16px', color: '#1A2332', fontSize: '15px', flex: i === 2 ? 2 : 1, textAlign: 'center',
                }}>
                  {v || '—'}
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <span style={{ color: '#6B7C93', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Gender
            </span>
            <GenderPill gender={c.patientGender as 'male' | 'female'} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <DisplayField label="File Number" value={c.fileNumber} />
            <DisplayField label="Hospital" value={c.hospital} />
          </div>
          <DisplayField label="Admission Date" value={c.admissionDate} />
        </AccordionSection>

        {/* SECTION 2 — Classification */}
        <AccordionSection
          icon="🩺" title="Classification"
          isExpanded={expandedSections.includes('classification')}
          onToggle={() => toggleSection('classification')}
          sectionRef={sectionRefs.classification}
          onEdit={() => toggleEdit('classification')}
          isEditing={editingSections.includes('classification')}
        >
          <DisplayField label="Specialty" value={c.specialty} />
          <DisplayField label="Provisional Diagnosis" value={c.provisionalDiagnosis} isMultiLine />
          <DisplayField label="Chief Complaint" value={c.chiefComplaint} />
        </AccordionSection>

        {/* SECTION 3 — Patient History */}
        <AccordionSection
          icon="📄" title="Patient History"
          isExpanded={expandedSections.includes('history')}
          onToggle={() => toggleSection('history')}
          sectionRef={sectionRefs.history}
          onEdit={() => toggleEdit('history')}
          isEditing={editingSections.includes('history')}
        >
          <DisplayField label="Chief Complaint" value={c.historyComplaint} isMultiLine />
          <DisplayField label="Present History" value={c.presentHistory} isMultiLine />
          <DisplayField label="Past Medical History" value={c.pastMedicalHistory} isMultiLine />
          <DisplayField label="Allergies" value={c.allergies} />
          <DisplayField label="Current Medications (Pre-Admission)" value={c.currentMedications} isMultiLine />
        </AccordionSection>

        {/* SECTION 4 — Investigations */}
        <AccordionSection
          icon="🔬" title="Investigations"
          isExpanded={expandedSections.includes('investigations')}
          onToggle={() => toggleSection('investigations')}
          sectionRef={sectionRefs.investigations}
          onAdd={() => setShowAddInvestigation(true)}
        >
          {investigations.map((inv) => {
            const isCardExpanded = expandedSubs.includes(`inv-${inv.id}`);
            const typeIcon = inv.type === 'Lab Result' ? '🧪' : inv.type === 'Imaging' ? '🩻' : '📄';
            return (
              <div key={inv.id}
                onClick={() => toggleSub(`inv-${inv.id}`)}
                className="cursor-pointer active:opacity-95 transition-opacity"
                style={{
                  background: '#FFFFFF', borderRadius: '14px', border: '1px solid #DDE3EA',
                  padding: '12px 16px', marginBottom: '10px',
                  boxShadow: '0px 1px 4px rgba(0,0,0,0.06)',
                }}>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A2332' }}>{inv.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span style={{ fontSize: '12px', color: '#6B7C93', fontWeight: 600 }}>{inv.type === 'Lab Result' ? 'Lab' : inv.type}</span>
                    <span style={{ fontSize: '16px' }}>{typeIcon}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span style={{ fontSize: '12px', color: '#6B7C93' }}>{inv.date}</span>
                  <div className="flex items-center gap-1">
                    {isCardExpanded && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); setEditInvestigation({ id: inv.id, name: inv.name, type: inv.type, date: inv.date, result: inv.result }); }} className="p-1 rounded-full hover:bg-muted/50">
                          <Pencil size={14} style={{ color: '#2563EB' }} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'inv', id: inv.id }); }} className="p-1 rounded-full hover:bg-muted/50">
                          <Trash2 size={14} style={{ color: '#EF4444' }} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #DDE3EA', margin: '8px 0' }} />

                {!isCardExpanded ? (
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: '13px', color: '#1A2332', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                      {inv.result || '—'}
                    </span>
                    <ChevronDown size={14} className="text-muted-foreground ml-2 flex-shrink-0" />
                  </div>
                ) : (
                  <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                    <div className="space-y-1.5">
                      <span style={{ color: '#6B7C93', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Result
                      </span>
                      <div style={{
                        background: '#F8FAFC', border: '1.5px solid #DDE3EA', borderRadius: '12px',
                        padding: '12px 16px', color: '#1A2332', fontSize: '15px', lineHeight: '1.5', minHeight: '60px',
                      }}>
                        {inv.result || '—'}
                      </div>
                    </div>

                    {(inv.images || []).length > 0 && (
                      <div className="space-y-1.5">
                        <span style={{ color: '#6B7C93', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Attached Images
                        </span>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar">
                          {(inv.images || []).slice(0, 3).map((_, i) => (
                            <div key={i} style={{
                              width: '72px', height: '72px', borderRadius: '10px',
                              background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                              <Image size={24} className="text-muted-foreground" />
                            </div>
                          ))}
                          {(inv.images || []).length > 3 && (
                            <div style={{
                              width: '72px', height: '72px', borderRadius: '10px',
                              background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                              fontSize: '13px', fontWeight: 700, color: '#6B7C93',
                            }}>
                              +{(inv.images || []).length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end" onClick={() => toggleSub(`inv-${inv.id}`)}>
                      <ChevronUp size={14} className="text-muted-foreground cursor-pointer" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {investigations.length === 0 && (
            <p className="text-muted-foreground text-[13px] text-center py-4">No investigations yet. Tap + to add.</p>
          )}
        </AccordionSection>

        {/* SECTION 5 — Management */}
        <AccordionSection
          icon="⚕️" title="Management"
          isExpanded={expandedSections.includes('management')}
          onToggle={() => toggleSection('management')}
          sectionRef={sectionRefs.management}
          onAdd={() => setShowAddManagement(true)}
        >
          {managementEntries.map((entry) => {
            const isCardExpanded = expandedSubs.includes(`mgmt-${entry.id}`);
            const typeIcon = entry.type === 'Medications' ? '💊' : entry.type === 'Respiratory Support' ? '🫁' : '🍼';
            return (
              <div key={entry.id}
                onClick={() => toggleSub(`mgmt-${entry.id}`)}
                className="cursor-pointer active:opacity-95 transition-opacity"
                style={{
                  background: '#FFFFFF', borderRadius: '14px', border: '1px solid #DDE3EA',
                  padding: '12px 16px', marginBottom: '10px',
                  boxShadow: '0px 1px 4px rgba(0,0,0,0.06)',
                }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '16px' }}>{typeIcon}</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A2332' }}>{entry.type}</span>
                  </div>
                  {isCardExpanded && (
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); setEditManagement({ id: entry.id, type: entry.type, medications: entry.type === 'Medications' ? (entry as any).medications?.join('\n') : '', mode: (entry as any).mode ?? '', details: (entry as any).details ?? '' }); }} className="p-1 rounded-full hover:bg-muted/50">
                        <Pencil size={14} style={{ color: '#2563EB' }} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'mgmt', id: entry.id }); }} className="p-1 rounded-full hover:bg-muted/50">
                        <Trash2 size={14} style={{ color: '#EF4444' }} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span style={{ fontSize: '12px', color: '#6B7C93' }}>{entry.date}</span>
                  <ChevronDown size={14} className="text-muted-foreground transition-transform duration-300"
                    style={{ transform: isCardExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </div>

                {isCardExpanded && (
                  <>
                    <div style={{ borderTop: '1px solid #DDE3EA', margin: '8px 0' }} />
                    <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                      {entry.type === 'Medications' && 'medications' in entry && (
                        <div className="space-y-1.5">
                          <span style={{ color: '#6B7C93', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Medications List
                          </span>
                          <div style={{
                            background: '#F8FAFC', border: '1.5px solid #DDE3EA', borderRadius: '12px',
                            padding: '12px 16px', color: '#1A2332', fontSize: '15px', lineHeight: '1.8',
                          }}>
                            {(entry as any).medications?.length > 0
                              ? (entry as any).medications.map((med: string, i: number) => <div key={i}>{i + 1}. {med}</div>)
                              : '—'}
                          </div>
                        </div>
                      )}
                      {(entry.type === 'Respiratory Support' || entry.type === 'Feeding') && 'mode' in entry && (
                        <>
                          <div className="space-y-1.5">
                            <span style={{ color: '#6B7C93', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Selected Mode
                            </span>
                            <div>
                              <span style={{
                                display: 'inline-flex', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 600,
                                background: '#2563EB', color: '#FFFFFF',
                              }}>
                                {(entry as any).mode || '—'}
                              </span>
                            </div>
                          </div>
                          <DisplayField label={entry.type === 'Feeding' ? 'Feeding Details' : 'Details'} value={(entry as any).details ?? ''} />
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
          {managementEntries.length === 0 && (
            <p className="text-muted-foreground text-[13px] text-center py-4">No management entries yet. Tap + to add.</p>
          )}
        </AccordionSection>

        {/* SECTION 6 — Progress Note */}
        <AccordionSection
          icon="📝" title="Progress Note"
          isExpanded={expandedSections.includes('progress')}
          onToggle={() => toggleSection('progress')}
          sectionRef={sectionRefs.progress}
          onAdd={() => setShowAddProgress(true)}
        >
          {progressNotes.map((note) => {
            const isCardExpanded = expandedSubs.includes(`prog-${note.id}`);
            return (
              <div key={note.id}
                onClick={() => toggleSub(`prog-${note.id}`)}
                className="cursor-pointer active:opacity-95 transition-opacity"
                style={{
                  background: '#FFFFFF', borderRadius: '14px', border: '1px solid #DDE3EA',
                  padding: '12px 16px', marginBottom: '10px',
                  boxShadow: '0px 1px 4px rgba(0,0,0,0.06)',
                }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '16px' }}>📝</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A2332' }}>Progress Note</span>
                  </div>
                  {isCardExpanded && (
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); setEditProgress({ id: note.id, date: note.date, assessment: note.assessment, vitals: note.vitals }); }} className="p-1 rounded-full hover:bg-muted/50">
                        <Pencil size={14} style={{ color: '#2563EB' }} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'prog', id: note.id }); }} className="p-1 rounded-full hover:bg-muted/50">
                        <Trash2 size={14} style={{ color: '#EF4444' }} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span style={{ fontSize: '12px', color: '#6B7C93' }}>{note.date}</span>
                  <ChevronDown size={14} className="text-muted-foreground transition-transform duration-300"
                    style={{ transform: isCardExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </div>

                {isCardExpanded && (
                  <>
                    <div style={{ borderTop: '1px solid #DDE3EA', margin: '8px 0' }} />
                    <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                      <DisplayField label="Assessment" value={note.assessment} isMultiLine />

                      <div
                        onClick={() => toggleSub(`vitals-${note.id}`)}
                        className="cursor-pointer active:opacity-95 transition-opacity"
                        style={{ background: '#F8FAFC', borderRadius: '12px', border: '1px solid #DDE3EA', overflow: 'hidden' }}
                      >
                        <div className="flex items-center justify-between hover:bg-muted/30 transition-colors" style={{ padding: '12px' }}>
                          <div className="flex items-center gap-2">
                            <span style={{ fontSize: '14px' }}>🫀</span>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A2332' }}>Vital Signs</span>
                          </div>
                          <ChevronDown size={16} className="text-muted-foreground transition-transform duration-300"
                            style={{ transform: expandedSubs.includes(`vitals-${note.id}`) ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                        </div>
                        {expandedSubs.includes(`vitals-${note.id}`) && note.vitals && (
                          <div onClick={(e) => e.stopPropagation()} style={{ padding: '0 12px 12px 12px', borderTop: '1px solid #DDE3EA' }} className="space-y-3 pt-3">
                            <div className="grid grid-cols-2 gap-3">
                              <DisplayField label="HR (BPM)" value={note.vitals.hr} />
                              <DisplayField label="SPO₂ (%)" value={note.vitals.spo2} />
                              <DisplayField label="TEMP (°C)" value={note.vitals.temp} />
                              <DisplayField label="RR (/MIN)" value={note.vitals.rr} />
                              <DisplayField label="BP (MMHG)" value={note.vitals.bp} />
                              <DisplayField label="WEIGHT (KG)" value={note.vitals.weight} />
                            </div>
                            <DisplayField label="Date & Time" value={note.vitals.dateTime} />
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
          {progressNotes.length === 0 && (
            <p className="text-muted-foreground text-[13px] text-center py-4">No progress notes yet. Tap + to add.</p>
          )}
        </AccordionSection>

        {/* Media Section */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
          <div className="px-4 py-3 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-[14px]">📸</span>
              <span className="text-[13px] font-bold text-foreground">Media ({media.length})</span>
            </div>
            <button onClick={() => navigate(`/case/${id}/media`)} className="text-[12px] text-primary font-medium">
              View All
            </button>
          </div>
          <div className="p-4 flex gap-3">
            {media.slice(0, 2).map((item: any) => (
              <div key={item.id} className="w-20 h-20 bg-muted rounded-lg overflow-hidden">
                {item.thumbnailUrl
                  ? <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                  : <div className="w-full h-full flex items-center justify-center"><Image size={24} className="text-muted-foreground" /></div>
                }
              </div>
            ))}
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 bg-muted/50 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <Camera size={20} />
              <span className="text-[9px] font-bold mt-1">ADD</span>
            </button>
          </div>
        </div>
      </div>

      {/* Export Sheet */}
      <ExportSheet
        open={showExport}
        onOpenChange={setShowExport}
        title="Case"
        data={exportData}
        columns={exportColumns}
        dateKey="date"
        cases={patientCasesForExport}
      />

      {/* Delete Case Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Case</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this case? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCase} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Card Confirmation */}
      {!!deleteTarget && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTarget(null)} />
          <div className="absolute inset-0 flex items-center justify-center px-8">
            <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '24px', width: '100%', maxWidth: '340px' }}>
              <div className="flex flex-col items-center text-center space-y-2">
                <Trash2 size={28} style={{ color: '#EF4444' }} />
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#1A2332' }}>Delete this record?</span>
                <span style={{ fontSize: '13px', color: '#6B7C93' }}>This action cannot be undone.</span>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setDeleteTarget(null)}
                  style={{ flex: 1, height: '48px', borderRadius: '12px', border: '1.5px solid #6B7C93', background: '#FFFFFF', color: '#6B7C93', fontSize: '15px', fontWeight: 600 }}>
                  Cancel
                </button>
                <button onClick={handleDeleteTarget}
                  style={{ flex: 1, height: '48px', borderRadius: '12px', border: 'none', background: '#EF4444', color: '#FFFFFF', fontSize: '15px', fontWeight: 600 }}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sheets — Add */}
      <AddInvestigationSheet
        open={showAddInvestigation}
        onClose={() => setShowAddInvestigation(false)}
        onSave={(data) => {
          createInvestigation({ caseId: id!, data });
          setShowAddInvestigation(false);
        }}
      />
      <AddManagementSheet
        open={showAddManagement}
        onClose={() => setShowAddManagement(false)}
        onSave={(data) => {
          createManagement({ caseId: id!, data });
          setShowAddManagement(false);
        }}
      />
      <AddProgressNoteSheet
        open={showAddProgress}
        onClose={() => setShowAddProgress(false)}
        onSave={(data) => {
          createProgressNote({ caseId: id!, data });
          setShowAddProgress(false);
        }}
      />

      {/* Bottom Sheets — Edit */}
      <AddInvestigationSheet
        open={!!editInvestigation}
        onClose={() => setEditInvestigation(null)}
        initialData={editInvestigation}
        onSave={(data) => {
          if (editInvestigation?.id) {
            updateInvestigation({ id: editInvestigation.id, caseId: id!, data });
          }
          setEditInvestigation(null);
        }}
      />
      <AddManagementSheet
        open={!!editManagement}
        onClose={() => setEditManagement(null)}
        initialData={editManagement}
        onSave={(data) => {
          if (editManagement?.id) {
            updateManagement({ id: editManagement.id, caseId: id!, data });
          }
          setEditManagement(null);
        }}
      />
      <AddProgressNoteSheet
        open={!!editProgress}
        onClose={() => setEditProgress(null)}
        initialData={editProgress}
        onSave={(data) => {
          if (editProgress?.id) {
            updateProgressNote({ id: editProgress.id, caseId: id!, data });
          }
          setEditProgress(null);
        }}
      />

      {/* Discharge Dialog */}
      {showDischargeDialog && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setShowDischargeDialog(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '20px', width: '100%', maxWidth: '360px' }}>
              <div className="flex items-center gap-2 mb-1">
                <LogOut size={20} style={{ color: '#10B981' }} />
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#1A2332' }}>Discharge Patient</span>
              </div>
              <span style={{ fontSize: '13px', color: '#6B7C93' }}>{c.patientName}</span>

              <div className="h-px my-4" style={{ backgroundColor: '#F0F4F8' }} />

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span style={{ color: '#6B7C93', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Discharge Date *
                  </span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="w-full h-11 px-4 border rounded-xl text-[14px] text-left flex items-center justify-between" style={{ borderColor: '#DDE3EA', background: '#FFFFFF', color: '#1A2332' }}>
                        {dischargeDate ? format(dischargeDate, 'MM/dd/yyyy') : 'mm/dd/yyyy'}
                        <CalendarDays size={16} style={{ color: '#94A3B8' }} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={dischargeDate} onSelect={(d) => d && setDischargeDate(d)} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1.5 relative">
                  <span style={{ color: '#6B7C93', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Outcome *
                  </span>
                  <button
                    onClick={() => setOutcomeDropdownOpen(prev => !prev)}
                    className="w-full flex items-center justify-between text-left transition-all"
                    style={{
                      height: 48, padding: '0 16px', borderRadius: '12px',
                      border: outcomeDropdownOpen ? '1.5px solid #2563EB' : '1.5px solid #DDE3EA',
                      background: '#F8FAFC', fontSize: '14px',
                      color: dischargeOutcome ? '#1A2332' : '#94A3B8',
                    }}
                  >
                    {outcomes.find(o => o.key === dischargeOutcome)?.label || 'Select outcome...'}
                    <ChevronDown size={16} style={{ color: '#94A3B8', transform: outcomeDropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                  </button>
                  {outcomeDropdownOpen && (
                    <div style={{ background: '#FFFFFF', border: '1.5px solid #DDE3EA', borderRadius: '12px', boxShadow: '0px 4px 12px rgba(0,0,0,0.10)', maxHeight: 200, overflowY: 'auto', marginTop: 4 }}>
                      {outcomes.map(o => (
                        <button
                          key={o.key}
                          onClick={() => { setDischargeOutcome(o.key); setOutcomeDropdownOpen(false); }}
                          className="w-full text-left transition-colors"
                          style={{
                            height: 44, padding: '0 16px', display: 'flex', alignItems: 'center',
                            background: dischargeOutcome === o.key ? '#EFF6FF' : 'transparent',
                            color: dischargeOutcome === o.key ? '#2563EB' : '#1A2332',
                            fontWeight: dischargeOutcome === o.key ? 700 : 400, fontSize: '13px',
                          }}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <span style={{ color: '#6B7C93', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Discharge Notes (optional)
                  </span>
                  <textarea
                    value={dischargeNotes}
                    onChange={(e) => setDischargeNotes(e.target.value)}
                    placeholder="e.g. condition on discharge..."
                    rows={3}
                    className="w-full px-4 py-3 border rounded-xl text-[14px] placeholder:text-muted-foreground focus:outline-none resize-none"
                    style={{ borderColor: '#DDE3EA', color: '#1A2332' }}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => { setShowDischargeDialog(false); setDischargeOutcome(null); setDischargeNotes(''); }}
                  style={{ border: '1.5px solid #DDE3EA', color: '#6B7C93', borderRadius: '12px', height: '48px', fontWeight: 600, fontSize: '14px', background: '#FFFFFF' }}
                  className="flex-1"
                >
                  Cancel
                </button>
                <button
                  disabled={!isDischargeValid}
                  onClick={() => {
                    dischargeCase({
                      id: id!,
                      data: {
                        date: format(dischargeDate, 'yyyy-MM-dd'),
                        outcome: dischargeOutcome!,
                        notes: dischargeNotes || undefined,
                      },
                    });
                    setShowDischargeDialog(false);
                    setDischargeOutcome(null);
                    setDischargeNotes('');
                  }}
                  style={{
                    background: isDischargeValid ? '#10B981' : '#D1D5DB',
                    color: isDischargeValid ? '#FFFFFF' : '#9CA3AF',
                    borderRadius: '12px', height: '48px', fontWeight: 600, fontSize: '14px',
                    cursor: isDischargeValid ? 'pointer' : 'not-allowed',
                  }}
                  className="flex-1"
                >
                  Discharge
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CaseDetailScreen;
