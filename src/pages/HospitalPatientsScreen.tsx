import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Search, ChevronRight, ChevronDown, Pencil, Trash2, Hospital, Building2, MapPin, Briefcase, CalendarDays, Stethoscope, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Mock hospital data
const mockHospital = {
  id: '1',
  name: "St. Jude Children's",
  department: 'Main Wing',
  location: 'Central Unit',
  position: 'resident',
  startDate: new Date('2023-06-10'),
  totalPatients: 142,
  activePatients: 38,
  dischargedPatients: 104,
};

// Mock patients for this hospital
const mockHospitalPatients = [
  { patientId: '1', name: 'Lucas Miller', age: 7, gender: 'male' as const, status: 'active' as const, specialty: 'Respiratory', dateAdded: '2025-01-10', caseCount: 4 },
  { patientId: '2', name: 'Sophia Chen', age: 3, gender: 'female' as const, status: 'active' as const, specialty: 'Cardiology', dateAdded: '2025-01-05', caseCount: 2 },
  { patientId: '3', name: 'Ethan Wright', age: 12, gender: 'male' as const, status: 'discharged' as const, specialty: 'Neurology', dateAdded: '2024-12-20', caseCount: 6 },
  { patientId: '4', name: 'Maya Johnson', age: 5, gender: 'female' as const, status: 'discharged' as const, specialty: 'General', dateAdded: '2024-11-15', caseCount: 1 },
  { patientId: '5', name: 'Noah Davis', age: 9, gender: 'male' as const, status: 'active' as const, specialty: 'Gastroenterology', dateAdded: '2024-10-01', caseCount: 3 },
  { patientId: '6', name: 'Ava Thompson', age: 0.08, gender: 'female' as const, status: 'discharged' as const, specialty: 'Cardiology', dateAdded: '2025-01-01', caseCount: 8 },
];

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

type FilterCategory = 'status' | 'ageGroup' | 'specialty' | 'dateRange';

const filterOptions: { category: FilterCategory; label: string; values: { key: string; label: string }[] }[] = [
  {
    category: 'status', label: 'Status', values: [
      { key: 'active', label: 'Active' },
      { key: 'discharged', label: 'Discharged' },
    ],
  },
  {
    category: 'ageGroup', label: 'Age Group', values: [
      { key: '0-2', label: '0 - 2 years' },
      { key: '2-5', label: '2 - 5 years' },
      { key: '5-12', label: '5 - 12 years' },
      { key: '12-18', label: '12 - 18 years' },
    ],
  },
  {
    category: 'specialty', label: 'Specialty', values: [
      { key: 'Respiratory', label: 'Respiratory' },
      { key: 'Cardiology', label: 'Cardiology' },
      { key: 'Neurology', label: 'Neurology' },
      { key: 'General', label: 'General' },
      { key: 'Dermatology', label: 'Dermatology' },
      { key: 'Gastroenterology', label: 'Gastroentero.' },
    ],
  },
];

const matchesAgeGroup = (ageYears: number, key: string) => {
  switch (key) {
    case '0-2': return ageYears >= 0 && ageYears < 2;
    case '2-5': return ageYears >= 2 && ageYears < 5;
    case '5-12': return ageYears >= 5 && ageYears < 12;
    case '12-18': return ageYears >= 12 && ageYears <= 18;
    default: return true;
  }
};

const matchesDateRange = (dateStr: string, key: string) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
  switch (key) {
    case 'month': return diffDays <= 30;
    case '3months': return diffDays <= 90;
    case '6months': return diffDays <= 180;
    case 'year': return diffDays <= 365;
    case 'custom': return true; // custom handled separately
    default: return true;
  }
};

/* ── Generic Filter Bottom Sheet ── */
const FilterSheet = ({ open, onClose, title, options, selected, onApply }: {
  open: boolean;
  onClose: () => void;
  title: string;
  options: { key: string; label: string }[];
  selected: string | null;
  onApply: (key: string | null) => void;
}) => {
  const [localSelected, setLocalSelected] = useState<string | null>(selected);

  useEffect(() => {
    if (open) setLocalSelected(selected);
  }, [open, selected]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-y-auto bg-background rounded-t-[24px] animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>
        <div className="px-5 pb-2 flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-foreground">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted text-muted-foreground"><X size={18} /></button>
        </div>
        <div className="px-5 pb-4 space-y-2">
          {/* All option */}
          <button
            onClick={() => setLocalSelected(null)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all"
            style={{
              borderColor: localSelected === null ? '#2563EB' : '#E2E8F0',
              backgroundColor: localSelected === null ? '#EFF6FF' : '#FFFFFF',
            }}
          >
            <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
              style={{ borderColor: localSelected === null ? '#2563EB' : '#CBD5E1' }}>
              {localSelected === null && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#2563EB' }} />}
            </div>
            <span className="text-[14px]" style={{ color: localSelected === null ? '#2563EB' : '#1A2332', fontWeight: localSelected === null ? 700 : 400 }}>
              {title === 'Age Group' ? 'All Ages' : 'All'}
            </span>
          </button>
          {options.map(o => (
            <button
              key={o.key}
              onClick={() => setLocalSelected(o.key)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all"
              style={{
                borderColor: localSelected === o.key ? '#2563EB' : '#E2E8F0',
                backgroundColor: localSelected === o.key ? '#EFF6FF' : '#FFFFFF',
              }}
            >
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                style={{ borderColor: localSelected === o.key ? '#2563EB' : '#CBD5E1' }}>
                {localSelected === o.key && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#2563EB' }} />}
              </div>
              <span className="text-[14px]" style={{ color: localSelected === o.key ? '#2563EB' : '#1A2332', fontWeight: localSelected === o.key ? 700 : 400 }}>
                {o.label}
              </span>
            </button>
          ))}
          <button
            onClick={() => { onApply(localSelected); onClose(); }}
            className="w-full h-[48px] rounded-xl font-semibold text-[14px] text-white mt-3"
            style={{ backgroundColor: '#2563EB' }}
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
};

/* ── Date Range Bottom Sheet ── */
const DateRangeSheet = ({ open, onClose, selected, onSelect }: {
  open: boolean;
  onClose: () => void;
  selected: string | null;
  onSelect: (key: string | null, fromDate?: Date, toDate?: Date) => void;
}) => {
  const presets = [
    { key: 'all', label: 'All' },
    { key: 'month', label: 'This Month' },
    { key: '3months', label: '3M' },
    { key: '6months', label: '6M' },
    { key: 'year', label: 'This Year' },
    { key: 'custom', label: 'Custom' },
  ];
  const [activePreset, setActivePreset] = useState(selected || 'all');
  const [fromStr, setFromStr] = useState('');
  const [toStr, setToStr] = useState('');

  useEffect(() => {
    if (open) {
      setActivePreset(selected || 'all');
      setFromStr('');
      setToStr('');
    }
  }, [open, selected]);

  const handleApply = () => {
    if (activePreset === 'all') {
      onSelect(null);
    } else if (activePreset === 'custom') {
      const from = fromStr ? new Date(fromStr) : undefined;
      const to = toStr ? new Date(toStr) : undefined;
      onSelect('custom', from, to);
    } else {
      onSelect(activePreset);
    }
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-y-auto bg-background rounded-t-[24px] animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>
        <div className="px-5 pb-2 flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-foreground">Select Date Range</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted text-muted-foreground"><X size={18} /></button>
        </div>
        <div className="px-5 pb-4">
          <div className="flex flex-wrap gap-2 mb-5">
            {presets.map(p => (
              <button
                key={p.key}
                onClick={() => setActivePreset(p.key)}
                className="px-3.5 py-2 rounded-full text-[12px] font-semibold transition-all"
                style={{
                  backgroundColor: activePreset === p.key ? '#2563EB' : '#F8FAFC',
                  color: activePreset === p.key ? '#FFFFFF' : '#64748B',
                  border: activePreset === p.key ? '1.5px solid #2563EB' : '1.5px solid #E2E8F0',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
          {activePreset === 'custom' && (
            <div className="flex gap-3 mb-5">
              <div className="flex-1 space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase">From</label>
                <input type="date" value={fromStr} onChange={e => setFromStr(e.target.value)}
                  className="w-full h-10 px-3 bg-card border border-border rounded-xl text-[13px] text-foreground focus:outline-none focus:border-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase">To</label>
                <input type="date" value={toStr} onChange={e => setToStr(e.target.value)}
                  className="w-full h-10 px-3 bg-card border border-border rounded-xl text-[13px] text-foreground focus:outline-none focus:border-primary" />
              </div>
            </div>
          )}
          <button onClick={handleApply}
            className="w-full h-[48px] rounded-xl font-semibold text-[14px] text-white"
            style={{ backgroundColor: '#2563EB' }}>
            Apply
          </button>
        </div>
      </div>
    </>
  );
};

/* ── Edit Hospital Sheet ── */
const EditHospitalSheet = ({ open, onClose, hospital }: {
  open: boolean;
  onClose: () => void;
  hospital: typeof mockHospital;
}) => {
  const [name, setName] = useState(hospital.name);
  const [department, setDepartment] = useState(hospital.department);
  const [location, setLocation] = useState(hospital.location);
  const [position, setPosition] = useState(hospital.position);
  const [startDate, setStartDate] = useState<Date | undefined>(hospital.startDate);

  useEffect(() => {
    if (open) {
      setName(hospital.name);
      setDepartment(hospital.department);
      setLocation(hospital.location);
      setPosition(hospital.position);
      setStartDate(hospital.startDate);
    }
  }, [open, hospital]);

  const isValid = name.trim() && department.trim();

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-y-auto bg-background rounded-t-[24px] animate-in slide-in-from-bottom duration-300">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="px-5 pb-4 flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-foreground">Edit Hospital</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted text-muted-foreground">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="px-5 pb-8 space-y-5">
          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-foreground flex items-center gap-2">
              <Building2 size={15} className="text-primary" /> Hospital Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter hospital name"
              className="w-full h-12 px-4 bg-card border border-border rounded-xl text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-foreground flex items-center gap-2">
              <Stethoscope size={15} className="text-primary" /> Department
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Enter department"
              className="w-full h-12 px-4 bg-card border border-border rounded-xl text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-foreground flex items-center gap-2">
              <MapPin size={15} className="text-primary" /> Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
              className="w-full h-12 px-4 bg-card border border-border rounded-xl text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-foreground flex items-center gap-2">
              <Briefcase size={15} className="text-primary" /> Position
            </label>
            <Select value={position} onValueChange={setPosition}>
              <SelectTrigger className="w-full h-12 px-4 bg-card border border-border rounded-xl text-[14px] focus:ring-primary/20">
                <SelectValue placeholder="Select your position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="intern">Intern</SelectItem>
                <SelectItem value="resident">Resident</SelectItem>
                <SelectItem value="registrar">Registrar</SelectItem>
                <SelectItem value="specialist">Specialist</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-foreground flex items-center gap-2">
              <CalendarDays size={15} className="text-primary" /> Start Working Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    'w-full h-12 px-4 bg-card border border-border rounded-xl text-[14px] text-left transition-all focus:outline-none focus:border-primary flex items-center justify-between',
                    !startDate && 'text-muted-foreground'
                  )}
                >
                  {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                  <CalendarDays size={16} className="text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className={cn('p-3 pointer-events-auto')}
                />
              </PopoverContent>
            </Popover>
          </div>

          <button
            onClick={() => { console.log('update hospital', { name, department, location, position, startDate }); onClose(); }}
            disabled={!isValid}
            className={cn(
              'w-full h-[52px] rounded-[12px] font-semibold text-[15px] transition-all',
              isValid
                ? 'bg-primary text-primary-foreground active:scale-[0.98]'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
};

/* ── Main Screen ── */
const HospitalPatientsScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string | null>>({});
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [openFilter, setOpenFilter] = useState<FilterCategory | null>(null);

  const hasActiveFilters = Object.values(activeFilters).some(Boolean);

  const toggleFilter = (category: string, key: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [category]: prev[category] === key ? null : key,
    }));
  };

  const clearAll = () => setActiveFilters({});

  const filtered = useMemo(() => {
    return mockHospitalPatients.filter(p => {
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (activeFilters.status && p.status !== activeFilters.status) return false;
      if (activeFilters.ageGroup && !matchesAgeGroup(p.age, activeFilters.ageGroup)) return false;
      if (activeFilters.specialty && p.specialty !== activeFilters.specialty) return false;
      if (activeFilters.dateRange && !matchesDateRange(p.dateAdded, activeFilters.dateRange)) return false;
      return true;
    });
  }, [searchQuery, activeFilters]);

  const handleDelete = () => {
    console.log('delete hospital', id);
    setDeleteOpen(false);
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Sub-header */}
      <header className="sticky top-0 z-40 px-4 py-3 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted text-muted-foreground">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-[16px] font-bold text-foreground">{mockHospital.name}</h1>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setEditOpen(true)} className="p-2 rounded-full hover:bg-muted text-muted-foreground">
            <Pencil size={16} />
          </button>
          <button onClick={() => setDeleteOpen(true)} className="p-2 rounded-full hover:bg-muted text-destructive">
            <Trash2 size={16} />
          </button>
        </div>
      </header>

      <div className="px-5 py-5 space-y-5">
        {/* Hospital Info Card */}
        <div className="relative overflow-hidden bg-card rounded-[18px] border border-border" style={{ boxShadow: '0px 2px 8px rgba(0,0,0,0.06)' }}>
          {/* Gradient top bar */}
          <div className="h-1 w-full gradient-brand" />
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 bg-accent rounded-xl flex items-center justify-center text-primary">
                <Hospital size={22} />
              </div>
              <div>
                <h2 className="text-[18px] font-bold text-foreground">{mockHospital.name}</h2>
                <p className="text-[13px] text-muted-foreground">{mockHospital.department} • {mockHospital.location}</p>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: mockHospital.totalPatients, label: 'PATIENTS' },
                { value: format(mockHospital.startDate, 'MMM d, yyyy'), label: 'SINCE' },
                { value: mockHospital.activePatients, label: 'ACTIVE' },
                { value: mockHospital.dischargedPatients, label: 'DISCHARGED' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-[10px] px-3 py-2 flex flex-col items-center justify-center" style={{ backgroundColor: '#F8FAFC' }}>
                  <span className="text-[16px] font-bold" style={{ color: '#2563EB' }}>{stat.value}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: '#94A3B8' }}>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-card border border-border rounded-2xl text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all shadow-card"
          />
        </div>

        {/* Filter Pills — all open bottom sheets */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {filterOptions.map((group) => {
            const sel = activeFilters[group.category];
            const selectedLabel = group.values.find(v => v.key === sel)?.label;
            const isActive = !!sel;
            return (
              <button
                key={group.category}
                onClick={() => setOpenFilter(group.category)}
                className="shrink-0 flex items-center gap-1.5 px-3 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap"
                style={{
                  height: 36,
                  backgroundColor: isActive ? '#EFF6FF' : 'transparent',
                  border: isActive ? '1.5px solid #2563EB' : '1.5px solid hsl(214,20%,85%)',
                  color: isActive ? '#2563EB' : 'hsl(215,16%,47%)',
                  fontWeight: isActive ? 700 : 600,
                }}
              >
                {selectedLabel || group.label}
                <ChevronDown size={13} />
              </button>
            );
          })}
          {/* Date Range pill */}
          <button
            onClick={() => setDateRangeOpen(true)}
            className="shrink-0 flex items-center gap-1.5 px-3 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap"
            style={{
              height: 36,
              backgroundColor: activeFilters.dateRange ? '#EFF6FF' : 'transparent',
              border: activeFilters.dateRange ? '1.5px solid #2563EB' : '1.5px solid hsl(214,20%,85%)',
              color: activeFilters.dateRange ? '#2563EB' : 'hsl(215,16%,47%)',
              fontWeight: activeFilters.dateRange ? 700 : 600,
            }}
          >
            {activeFilters.dateRange
              ? activeFilters.dateRange === 'month' ? 'This Month'
                : activeFilters.dateRange === '3months' ? '3M'
                : activeFilters.dateRange === '6months' ? '6M'
                : activeFilters.dateRange === 'year' ? 'This Year'
                : activeFilters.dateRange === 'custom' ? 'Custom'
                : 'Date Range'
              : 'Date Range'}
            <ChevronDown size={13} />
          </button>
          {hasActiveFilters && (
            <button onClick={clearAll} className="shrink-0 text-[11px] font-semibold" style={{ color: '#2563EB' }}>
              Clear
            </button>
          )}
        </div>

        {/* Count */}
        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-bold text-foreground">{filtered.length} Patients</h3>
        </div>

        {/* Patient List */}
        <div className="space-y-3">
          {filtered.map((patient) => (
            <div
              key={patient.patientId}
              onClick={() => navigate(`/patient/${patient.patientId}`)}
              className="group flex items-center justify-between p-3 bg-card border border-border rounded-xl active:scale-[0.98] transition-all cursor-pointer hover:shadow-card"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-avatar flex items-center justify-center text-primary-foreground font-bold text-[14px] shadow-sm">
                  {getInitials(patient.name)}
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-foreground">{patient.name}</h4>
                  <p className="text-[11px] text-muted-foreground">
                    {patient.age >= 1 ? `${Math.floor(patient.age)}y` : `${Math.round(patient.age * 12)}m`} • {patient.gender} • {patient.caseCount} cases
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                  patient.status === 'active'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {patient.status}
                </span>
                <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-10 text-center text-[13px] text-muted-foreground">No patients match the filters</div>
          )}
        </div>
      </div>

      {/* Edit Hospital Sheet */}
      <EditHospitalSheet open={editOpen} onClose={() => setEditOpen(false)} hospital={mockHospital} />

      {/* Filter Bottom Sheets */}
      {filterOptions.map(group => (
        <FilterSheet
          key={group.category}
          open={openFilter === group.category}
          onClose={() => setOpenFilter(null)}
          title={group.label}
          options={group.values}
          selected={activeFilters[group.category] || null}
          onApply={(key) => setActiveFilters(prev => ({ ...prev, [group.category]: key }))}
        />
      ))}

      {/* Date Range Sheet */}
      <DateRangeSheet
        open={dateRangeOpen}
        onClose={() => setDateRangeOpen(false)}
        selected={activeFilters.dateRange || null}
        onSelect={(key) => setActiveFilters(prev => ({ ...prev, dateRange: key }))}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hospital</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{mockHospital.name}"? This action cannot be undone and will remove all associated data.
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

export default HospitalPatientsScreen;
