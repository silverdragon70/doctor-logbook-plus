import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Camera, Image, ChevronDown, ChevronUp, Upload, Lightbulb, Pencil, Plus, LogOut, CalendarDays, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
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

// Mock data
const mockCase = {
  caseId: '1',
  patientName: 'Lucas Miller',
  patientAge: 7,
  patientGender: 'male' as const,
  date: '2025-01-15',
  fileNumber: '24-10842',
  hospital: 'Cairo Univ.',
  dob: { day: '15', month: '01', year: '2018' },
  admissionDate: '15 / 01 / 2025',
  specialty: 'Respiratory',
  provisionalDiagnosis: 'Acute bronchitis with possible reactive airway disease',
  chiefComplaint: 'Persistent cough',
  historyComplaint: 'Persistent cough for 2 weeks, worsening at night. No fever initially but developed low-grade fever 3 days ago.',
  presentHistory: '',
  pastMedicalHistory: '',
  allergies: '',
  currentMedications: '',
  investigations: [
    { id: '1', name: 'CBC', type: 'Lab Result' as const, date: '05/03/2025', result: 'WBC: 12.5, HGB: 10.2, PLT: 320, Neutrophils: 68%, Lymphocytes: 22%', images: ['img1.jpg', 'img2.jpg'] },
    { id: '2', name: 'Chest X-Ray', type: 'Imaging' as const, date: '06/03/2025', result: 'Bilateral infiltrates noted in lower lobes. No pleural effusion. Heart size normal.', images: [] },
    { id: '3', name: 'Echo', type: 'Imaging' as const, date: '07/03/2025', result: 'Normal cardiac function. EF 65%. No structural abnormalities detected.', images: ['img3.jpg', 'img4.jpg', 'img5.jpg', 'img6.jpg', 'img7.jpg'] },
  ],
  managementEntries: [
    { id: 'm1', type: 'Medications' as const, date: '05/03/2025', medications: ['Cefotaxime 1g IV q8h', 'Azithromycin 150mg PO OD', 'Salbutamol nebulization q6h'], chartImage: '' },
    { id: 'm2', type: 'Respiratory Support' as const, date: '05/03/2025', mode: 'Nasal O₂', details: '2 L/min' },
    { id: 'm3', type: 'Feeding' as const, date: '06/03/2025', mode: 'Nasogastric', details: '60 mL/hr, formula type...' },
  ],
  progressNotes: [
    {
      id: 'p1', date: '05/03/2025', assessment: 'Patient showing improvement. Fever subsiding. Cough less frequent.',
      vitals: { hr: '128', spo2: '94', temp: '38.6', rr: '46', bp: '88/55', weight: '13.2', dateTime: '05/03/2025  07:00 AM' },
    },
    {
      id: 'p2', date: '06/03/2025', assessment: 'Continued improvement. Tolerating feeds well. SpO2 stable on room air.',
      vitals: { hr: '118', spo2: '97', temp: '37.2', rr: '32', bp: '90/58', weight: '13.2', dateTime: '06/03/2025  08:30 AM' },
    },
  ],
  mediaCount: 2,
};

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

const patientCaseHistory = [
  { id: '1', diagnosis: 'Acute bronchitis', date: '2025-01-15', complaint: 'Persistent cough' },
  { id: '2', diagnosis: 'Viral infection', date: '2024-11-20', complaint: 'Fever' },
  { id: '3', diagnosis: 'Contact dermatitis', date: '2024-09-05', complaint: 'Rash' },
  { id: '4', diagnosis: 'Healthy', date: '2024-06-10', complaint: 'Well-child check' },
];

// Reusable display field
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

// Accordion section wrapper
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

// Nested sub-accordion
const SubAccordion = ({
  icon, title, isExpanded, onToggle, children,
}: {
  icon: string; title: string; isExpanded: boolean; onToggle: () => void; children: React.ReactNode;
}) => (
  <div style={{ background: '#F8FAFC', borderRadius: '14px', border: '1px solid #DDE3EA', overflow: 'hidden' }}>
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between hover:bg-muted/30 transition-colors"
      style={{ padding: '12px' }}
    >
      <div className="flex items-center gap-2">
        <span style={{ fontSize: '14px' }}>{icon}</span>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A2332' }}>{title}</span>
      </div>
      <ChevronDown
        size={16}
        className="text-muted-foreground transition-transform duration-300"
        style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
      />
    </button>
    <div
      className="transition-all duration-300 ease-in-out overflow-hidden"
      style={{ maxHeight: isExpanded ? '1500px' : '0', opacity: isExpanded ? 1 : 0 }}
    >
      <div style={{ padding: '0 12px 12px 12px', borderTop: '1px solid #DDE3EA' }} className="space-y-3 pt-3">
        {children}
      </div>
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
  const { id } = useParams();
  const [showExport, setShowExport] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activePill, setActivePill] = useState('patientInfo');

  // Expanded states
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [expandedSubs, setExpandedSubs] = useState<string[]>([]);
  const [editingSections, setEditingSections] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
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
  const [caseStatus, setCaseStatus] = useState<'active' | 'discharged'>('active');

  const toggleEdit = (key: string) => {
    setEditingSections(prev => prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]);
  };

  // Section refs
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

  const handleDelete = () => {
    setShowDeleteDialog(false);
    navigate(-1);
  };

  const exportData = [
    { field: 'Patient Name', value: mockCase.patientName, date: mockCase.date },
    { field: 'Diagnosis', value: mockCase.provisionalDiagnosis, date: mockCase.date },
    { field: 'Chief Complaint', value: mockCase.chiefComplaint, date: mockCase.date },
  ];

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
          <button onClick={() => navigate(`/case/${id}/pearl`, { state: { caseData: mockCase } })} className="p-2 rounded-full hover:bg-muted transition-colors" style={{ color: '#D97706' }}>
            <Lightbulb size={18} />
          </button>
          <button
            onClick={() => caseStatus !== 'discharged' && setShowDischargeDialog(true)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            style={{ color: caseStatus === 'discharged' ? '#94A3B8' : '#10B981', cursor: caseStatus === 'discharged' ? 'default' : 'pointer' }}
            disabled={caseStatus === 'discharged'}
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
              LM
            </div>
            <div className="flex-1">
              <h3 className="text-[16px] font-bold text-foreground">{mockCase.patientName}</h3>
              <p className="text-[12px] text-muted-foreground">{mockCase.patientAge}y • {mockCase.patientGender} • {mockCase.date}</p>
            </div>
            <div className="px-2.5 py-1 bg-accent rounded-full text-[10px] font-bold text-accent-foreground">
              {mockCase.mediaCount} 📷
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
          <DisplayField label="Full Name (English)" value={mockCase.patientName} />
          <div className="space-y-1.5">
            <span style={{ color: '#6B7C93', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Date of Birth
            </span>
            <div className="flex gap-2">
              {[mockCase.dob.day, mockCase.dob.month, mockCase.dob.year].map((v, i) => (
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
            <GenderPill gender={mockCase.patientGender} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <DisplayField label="File Number" value={mockCase.fileNumber} />
            <DisplayField label="Hospital" value={mockCase.hospital} />
          </div>
          <DisplayField label="Admission Date" value={mockCase.admissionDate} />
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
          <DisplayField label="Specialty" value={mockCase.specialty} />
          <DisplayField label="Provisional Diagnosis" value={mockCase.provisionalDiagnosis} isMultiLine />
          <DisplayField label="Chief Complaint" value={mockCase.chiefComplaint} />
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
          <DisplayField label="Chief Complaint" value={mockCase.historyComplaint} isMultiLine />
          <DisplayField label="Present History" value={mockCase.presentHistory} isMultiLine />
          <DisplayField label="Past Medical History" value={mockCase.pastMedicalHistory} isMultiLine />
          <DisplayField label="Allergies" value={mockCase.allergies} />
          <DisplayField label="Current Medications (Pre-Admission)" value={mockCase.currentMedications} isMultiLine />
        </AccordionSection>

        {/* SECTION 4 — Investigations */}
        <AccordionSection
          icon="🔬" title="Investigations"
          isExpanded={expandedSections.includes('investigations')}
          onToggle={() => toggleSection('investigations')}
          sectionRef={sectionRefs.investigations}
          onAdd={() => setShowAddInvestigation(true)}
        >
          {/* UI LOGIC — Investigation Cards
              Render one card per investigation record.
              Each card is independently expandable.
              All cards collapsed by default.
              ✏️ icon appears only when card is expanded.
              Image thumbnails hidden if no images attached.
              END UI LOGIC */}
          {/* BACKEND LOGIC — Investigations Data
              Fetch all investigations where
              investigation.case_id = current case ID
              Order by investigation.date DESC
              Each card maps to one investigation record.
              END BACKEND LOGIC */}
          {(mockCase.investigations || []).map((inv) => {
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
                {/* Card header */}
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
                        <button onClick={(e) => { e.stopPropagation(); setEditInvestigation({ name: inv.name, type: inv.type, date: inv.date, result: inv.result }); }} className="p-1 rounded-full hover:bg-muted/50">
                          <Pencil size={14} style={{ color: '#2563EB' }} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(`inv-${inv.id}`); }} className="p-1 rounded-full hover:bg-muted/50">
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
        </AccordionSection>

        {/* SECTION 5 — Management */}
        <AccordionSection
          icon="⚕️" title="Management"
          isExpanded={expandedSections.includes('management')}
          onToggle={() => toggleSection('management')}
          sectionRef={sectionRefs.management}
          onAdd={() => setShowAddManagement(true)}
        >
          {/* UI LOGIC — Management Cards
              Render one card per management entry.
              Each card is independently expandable.
              All cards collapsed by default.
              ✏️ icon appears only when card is expanded.
              END UI LOGIC */}
          {/* BACKEND LOGIC — Management Data
              Fetch all management entries where management.case_id = current case ID
              Order by management.date DESC
              Each card maps to one management record.
              END BACKEND LOGIC */}
          {(mockCase.managementEntries || []).map((entry) => {
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
                      <button onClick={(e) => { e.stopPropagation(); setEditManagement({ type: entry.type, medications: 'medications' in entry ? (entry as any).medications?.join('\n') : '', mode: 'mode' in entry ? (entry as any).mode : '', details: 'details' in entry ? (entry as any).details : '' }); }} className="p-1 rounded-full hover:bg-muted/50">
                        <Pencil size={14} style={{ color: '#2563EB' }} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(`mgmt-${entry.id}`); }} className="p-1 rounded-full hover:bg-muted/50">
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
                        <>
                          <div className="space-y-1.5">
                            <span style={{ color: '#6B7C93', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Medications List
                            </span>
                            <div style={{
                              background: '#F8FAFC', border: '1.5px solid #DDE3EA', borderRadius: '12px',
                              padding: '12px 16px', color: '#1A2332', fontSize: '15px', lineHeight: '1.8',
                            }}>
                              {(entry as any).medications.length > 0
                                ? (entry as any).medications.map((med: string, i: number) => <div key={i}>{i + 1}. {med}</div>)
                                : '—'}
                            </div>
                          </div>
                        </>
                      )}
                      {entry.type === 'Respiratory Support' && 'mode' in entry && (
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
                          <DisplayField label="Details" value={(entry as any).details} />
                        </>
                      )}
                      {entry.type === 'Feeding' && 'mode' in entry && (
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
                          <DisplayField label="Feeding Details" value={(entry as any).details} />
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </AccordionSection>

        {/* SECTION 6 — Progress Note */}
        <AccordionSection
          icon="📝" title="Progress Note"
          isExpanded={expandedSections.includes('progress')}
          onToggle={() => toggleSection('progress')}
          sectionRef={sectionRefs.progress}
          onAdd={() => setShowAddProgress(true)}
        >
          {/* UI LOGIC — Progress Note Cards
              Render one card per progress note entry.
              Each card is independently expandable.
              Each card has its own nested Vital Signs.
              All cards and nested vitals collapsed by default.
              ✏️ icon appears only when card is expanded.
              END UI LOGIC */}
          {/* BACKEND LOGIC — Progress Note Data
              Fetch all progress notes where progress_note.case_id = current case ID
              Order by progress_note.date DESC
              Each card maps to one progress_note record.
              Vital Signs fetched from vitals table where vitals.progress_note_id = progress_note.id
              END BACKEND LOGIC */}
          {(mockCase.progressNotes || []).map((note) => {
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
                      <button onClick={(e) => { e.stopPropagation(); setEditProgress({ date: note.date, assessment: note.assessment, vitals: note.vitals }); }} className="p-1 rounded-full hover:bg-muted/50">
                        <Pencil size={14} style={{ color: '#2563EB' }} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(`prog-${note.id}`); }} className="p-1 rounded-full hover:bg-muted/50">
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

                      {/* Nested Vital Signs */}
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
                        {expandedSubs.includes(`vitals-${note.id}`) && (
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
        </AccordionSection>

        {/* Media Section */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
          <div className="px-4 py-3 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-[14px]">📸</span>
              <span className="text-[13px] font-bold text-foreground">Media ({mockCase.mediaCount})</span>
            </div>
            <button onClick={() => navigate(`/case/${id}/media`)} className="text-[12px] text-primary font-medium">
              View All
            </button>
          </div>
          <div className="p-4 flex gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                <Image size={24} className="text-muted-foreground" />
              </div>
            ))}
            <button
              onClick={() => console.log('add media')}
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
        cases={patientCaseHistory}
      />

      {/* Delete Confirmation */}
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
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Card Confirmation — Custom styled */}
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
                <button onClick={() => { console.log('delete card', deleteTarget); setDeleteTarget(null); }}
                  style={{ flex: 1, height: '48px', borderRadius: '12px', border: 'none', background: '#EF4444', color: '#FFFFFF', fontSize: '15px', fontWeight: 600 }}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sheets — Add */}
      <AddInvestigationSheet open={showAddInvestigation} onClose={() => setShowAddInvestigation(false)} onSave={(data) => console.log('save investigation', data)} />
      <AddManagementSheet open={showAddManagement} onClose={() => setShowAddManagement(false)} onSave={(data) => console.log('save management', data)} />
      <AddProgressNoteSheet open={showAddProgress} onClose={() => setShowAddProgress(false)} onSave={(data) => console.log('save progress', data)} />

      {/* Bottom Sheets — Edit (pre-filled) */}
      <AddInvestigationSheet open={!!editInvestigation} onClose={() => setEditInvestigation(null)} onSave={(data) => { console.log('update investigation', data); setEditInvestigation(null); }} initialData={editInvestigation} />
      <AddManagementSheet open={!!editManagement} onClose={() => setEditManagement(null)} onSave={(data) => { console.log('update management', data); setEditManagement(null); }} initialData={editManagement} />
      <AddProgressNoteSheet open={!!editProgress} onClose={() => setEditProgress(null)} onSave={(data) => { console.log('update progress', data); setEditProgress(null); }} initialData={editProgress} />

      {/* Discharge Dialog */}
      {showDischargeDialog && (() => {
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
        const isValid = !!dischargeDate && !!dischargeOutcome;
        return (
          <>
            <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setShowDischargeDialog(false)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '20px', width: '100%', maxWidth: '360px' }}>
                <div className="flex items-center gap-2 mb-1">
                  <LogOut size={20} style={{ color: '#10B981' }} />
                  <span style={{ fontSize: '16px', fontWeight: 700, color: '#1A2332' }}>Discharge Patient</span>
                </div>
                <span style={{ fontSize: '13px', color: '#6B7C93' }}>{mockCase.patientName}</span>

                <div className="h-px my-4" style={{ backgroundColor: '#F0F4F8' }} />

                <div className="space-y-4">
                  {/* Date */}
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

                  {/* Outcome */}
                  <div className="space-y-1.5">
                    <span style={{ color: '#6B7C93', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Outcome *
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {outcomes.map(o => (
                        <button
                          key={o.key}
                          onClick={() => setDischargeOutcome(o.key)}
                          className="flex items-center gap-2 text-left transition-all"
                          style={{
                            padding: '10px 12px',
                            borderRadius: '12px',
                            border: dischargeOutcome === o.key ? '1.5px solid #2563EB' : '1.5px solid #DDE3EA',
                            background: dischargeOutcome === o.key ? '#EFF6FF' : '#F8FAFC',
                            color: dischargeOutcome === o.key ? '#2563EB' : '#1A2332',
                            fontSize: '13px',
                            fontWeight: dischargeOutcome === o.key ? 700 : 400,
                          }}
                        >
                          <span style={{ fontSize: '14px' }}>{o.icon}</span>
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
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
                    disabled={!isValid}
                    onClick={() => {
                      console.log('discharge', { date: dischargeDate, outcome: dischargeOutcome, notes: dischargeNotes });
                      setCaseStatus('discharged');
                      setShowDischargeDialog(false);
                      setDischargeOutcome(null);
                      setDischargeNotes('');
                    }}
                    style={{
                      background: isValid ? '#10B981' : '#D1D5DB',
                      color: isValid ? '#FFFFFF' : '#9CA3AF',
                      borderRadius: '12px', height: '48px', fontWeight: 600, fontSize: '14px',
                      cursor: isValid ? 'pointer' : 'not-allowed',
                    }}
                    className="flex-1"
                  >
                    Discharge
                  </button>
                </div>
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
};

export default CaseDetailScreen;
