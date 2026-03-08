import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Camera, Image, ChevronDown, ChevronUp, Upload, Lightbulb, Pencil, Plus } from 'lucide-react';
import ExportSheet from '@/components/ExportSheet';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  investigationName: '',
  investigationType: '',
  investigationDate: '',
  investigationResult: '',
  investigationImages: ['preview1.jpg', 'preview2.jpg', 'preview3.jpg', 'preview4.jpg', 'preview5.jpg'] as string[],
  medications: ['Cefotaxime 1g IV q8h', 'Salbutamol nebulization q6h', 'Oral prednisolone 1mg/kg x 3 days'],
  medicationChartImage: '',
  respiratorySupport: 'Nasal O₂',
  respiratoryDetails: '2 L/min',
  feedingType: 'Nasogastric',
  feedingDetails: '60 mL/hr, formula type...',
  progressDate: '05 / 03 / 2025',
  assessment: '',
  vitals: {
    hr: '128', spo2: '94', temp: '38.6', rr: '46',
    bp: '88/55', weight: '13.2', dateTime: '05/03/2025  07:00 AM',
  },
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
          <button onClick={() => navigate(`/case/${id}/edit`)} className="p-2 rounded-full hover:bg-muted text-muted-foreground">
            <Edit2 size={18} />
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
          onAdd={() => console.log('add investigation')}
          onEdit={() => toggleEdit('investigations')}
          isEditing={editingSections.includes('investigations')}
        >
          <DisplayField label="Investigation Name" value={mockCase.investigationName} />
          <div className="grid grid-cols-2 gap-3">
            <DisplayField label="Type" value={mockCase.investigationType} />
            <DisplayField label="Date" value={mockCase.investigationDate} />
          </div>
          <DisplayField label="Result (Text)" value={mockCase.investigationResult} isMultiLine />
          {/* UI LOGIC — Investigations Image Thumbnails
              Show the thumbnails container ONLY if the
              investigation has attached images.
              If investigation.images.length === 0
              → hide the thumbnails container completely
              If investigation.images.length > 0
              → show thumbnails container with all images
              This is conditional rendering (UI only).
              No backend call needed — images array comes
              from the case data already loaded on this screen.
              END UI LOGIC */}
          {mockCase.investigationImages.length > 0 && (
            <div className="space-y-1.5">
              <span style={{ color: '#6B7C93', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Attached Images
              </span>
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {mockCase.investigationImages.map((_, i) => (
                  <div key={i} style={{
                    width: '72px', height: '72px', borderRadius: '10px',
                    background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Image size={24} className="text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </AccordionSection>

        {/* SECTION 5 — Management */}
        <AccordionSection
          icon="⚕️" title="Management"
          isExpanded={expandedSections.includes('management')}
          onToggle={() => toggleSection('management')}
          sectionRef={sectionRefs.management}
          onAdd={() => console.log('add management')}
          onEdit={() => toggleEdit('management')}
          isEditing={editingSections.includes('management')}
        >
          {/* Sub 5A — Medications */}
          <SubAccordion
            icon="💊" title="Medications"
            isExpanded={expandedSubs.includes('medications')}
            onToggle={() => toggleSub('medications')}
          >
            <div className="space-y-1.5">
              <span style={{ color: '#6B7C93', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Medications List
              </span>
              <div style={{
                background: '#F8FAFC', border: '1.5px solid #DDE3EA', borderRadius: '12px',
                padding: '12px 16px', color: '#1A2332', fontSize: '15px', lineHeight: '1.8',
              }}>
                {mockCase.medications.length > 0
                  ? mockCase.medications.map((med, i) => <div key={i}>{i + 1}. {med}</div>)
                  : '—'}
              </div>
            </div>
          </SubAccordion>

          {/* Sub 5B — Respiratory Support */}
          <SubAccordion
            icon="🫁" title="Respiratory Support"
            isExpanded={expandedSubs.includes('respiratory')}
            onToggle={() => toggleSub('respiratory')}
          >
            <div className="space-y-1.5">
              <span style={{
                display: 'inline-flex', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 600,
                background: '#2563EB', color: '#FFFFFF',
              }}>
                {mockCase.respiratorySupport || '—'}
              </span>
            </div>
            <DisplayField label="Details" value={mockCase.respiratoryDetails} />
          </SubAccordion>

          {/* Sub 5C — Feeding */}
          <SubAccordion
            icon="🍼" title="Feeding"
            isExpanded={expandedSubs.includes('feeding')}
            onToggle={() => toggleSub('feeding')}
          >
            <div className="space-y-1.5">
              <span style={{
                display: 'inline-flex', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 600,
                background: '#2563EB', color: '#FFFFFF',
              }}>
                {mockCase.feedingType || '—'}
              </span>
            </div>
            <DisplayField label="Feeding Details" value={mockCase.feedingDetails} />
          </SubAccordion>
        </AccordionSection>

        {/* SECTION 6 — Progress Note */}
        <AccordionSection
          icon="📝" title="Progress Note"
          isExpanded={expandedSections.includes('progress')}
          onToggle={() => toggleSection('progress')}
          sectionRef={sectionRefs.progress}
        >
          <DisplayField label="Date" value={mockCase.progressDate} />
          <DisplayField label="Assessment" value={mockCase.assessment} isMultiLine />

          {/* Nested Vital Signs */}
          <SubAccordion
            icon="🫀" title="Vital Signs"
            isExpanded={expandedSubs.includes('vitals')}
            onToggle={() => toggleSub('vitals')}
          >
            <div className="grid grid-cols-2 gap-3">
              <DisplayField label="HR (BPM)" value={mockCase.vitals.hr} />
              <DisplayField label="SPO₂ (%)" value={mockCase.vitals.spo2} />
              <DisplayField label="TEMP (°C)" value={mockCase.vitals.temp} />
              <DisplayField label="RR (/MIN)" value={mockCase.vitals.rr} />
              <DisplayField label="BP (MMHG)" value={mockCase.vitals.bp} />
              <DisplayField label="WEIGHT (KG)" value={mockCase.vitals.weight} />
            </div>
            <DisplayField label="Date & Time" value={mockCase.vitals.dateTime} />
          </SubAccordion>
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
    </div>
  );
};

export default CaseDetailScreen;
