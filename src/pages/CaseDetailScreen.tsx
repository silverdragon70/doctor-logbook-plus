import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Camera, Image, ChevronDown, ChevronUp, Save, Upload, Lightbulb } from 'lucide-react';
import ExportSheet from '@/components/ExportSheet';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const mockCase = {
  caseId: '1',
  patientName: 'Lucas Miller',
  patientAge: 7,
  patientGender: 'male',
  date: '2025-01-15',
  complaint: 'Persistent cough for 2 weeks, worsening at night. No fever initially but developed low-grade fever 3 days ago.',
  history: 'Previously healthy. No known allergies. Vaccinations up to date. No recent travel.',
  examination: 'Temp 37.8°C, RR 28/min, SpO2 96%. Bilateral wheeze on auscultation. No retractions.',
  investigations: 'CXR: Bilateral peribronchial thickening. CBC: WBC 11.2, Lymphocytes predominant.',
  diagnosis: 'Acute bronchitis with possible reactive airway disease',
  management: 'Salbutamol nebulization q6h. Oral prednisolone 1mg/kg x 3 days. Follow-up in 48 hours.',
  notes: 'Mother reports improvement with nebulization. Consider allergy testing if symptoms recur.',
  mediaCount: 2,
};

const sections = [
  { key: 'complaint', label: 'Chief Complaint', icon: '🩺' },
  { key: 'history', label: 'History', icon: '📋' },
  { key: 'examination', label: 'Examination', icon: '🔍' },
  { key: 'investigations', label: 'Investigations', icon: '🧪' },
  { key: 'diagnosis', label: 'Diagnosis', icon: '🏥' },
  { key: 'management', label: 'Management', icon: '💊' },
  { key: 'notes', label: 'Notes', icon: '📝' },
] as const;

const exportColumns = [
  { header: 'Field', key: 'field' },
  { header: 'Value', key: 'value' },
];

const CaseDetailScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [expandedSections, setExpandedSections] = useState<string[]>(['complaint', 'diagnosis', 'management']);
  const [isEditing, setIsEditing] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const toggleSection = (key: string) => {
    setExpandedSections(prev =>
      prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]
    );
  };

  // Prepare export data: each clinical section as a row
  const exportData = sections.map(({ key, label }) => ({
    field: label,
    value: mockCase[key as keyof typeof mockCase] as string,
    date: mockCase.date,
  }));

  const handleDelete = () => {
    console.log('delete case', id);
    setShowDeleteDialog(false);
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header */}
      <header className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-muted text-muted-foreground">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-[16px] font-bold text-foreground">Case Details</h1>
        <div className="flex gap-1">
          {/* Export */}
          <button
            onClick={() => setShowExport(true)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            style={{ color: '#2563EB' }}
          >
            <Upload size={18} />
          </button>
          {/* CasePearl */}
          <button
            onClick={() => navigate(`/case/${id}/pearl`, { state: { caseData: mockCase } })}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            style={{ color: '#D97706' }}
          >
            <Lightbulb size={18} />
          </button>
          {/* Edit */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`p-2 rounded-full transition-colors ${isEditing ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
          >
            {isEditing ? <Save size={18} /> : <Edit2 size={18} />}
          </button>
          {/* Delete */}
          <button onClick={() => setShowDeleteDialog(true)} className="p-2 rounded-full hover:bg-muted text-destructive">
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      <div className="px-5 py-5 space-y-4 pb-10">
        {/* Patient Info Card */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
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

        {/* Clinical Sections */}
        {sections.map(({ key, label, icon }) => {
          const value = mockCase[key as keyof typeof mockCase] as string;
          const isExpanded = expandedSections.includes(key);
          return (
            <div key={key} className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
              <button
                onClick={() => toggleSection(key)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[14px]">{icon}</span>
                  <span className="text-[13px] font-bold text-foreground">{label}</span>
                </div>
                {isExpanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-border pt-3">
                  {isEditing ? (
                    <textarea
                      defaultValue={value}
                      onChange={() => console.log('editing', key)}
                      className="w-full min-h-[80px] text-[13px] text-foreground bg-muted/50 rounded-lg p-3 border border-border focus:outline-none focus:border-primary resize-none"
                    />
                  ) : (
                    <p className="text-[13px] text-foreground leading-relaxed">{value || <span className="text-muted-foreground italic">Not recorded</span>}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Media Section */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
          <div className="px-4 py-3 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-[14px]">📸</span>
              <span className="text-[13px] font-bold text-foreground">Media ({mockCase.mediaCount})</span>
            </div>
            <button
              onClick={() => navigate(`/case/${id}/media`)}
              className="text-[12px] text-primary font-medium"
            >
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
