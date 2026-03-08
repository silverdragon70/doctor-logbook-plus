import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Plus, ChevronDown, Loader2 } from 'lucide-react';
import { usePatients } from '@/hooks/usePatients';

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

type FilterCategory = 'dateAdded' | 'ageGroup' | 'specialty';

const filterOptions: { category: FilterCategory; label: string; values: { key: string; label: string }[] }[] = [
  {
    category: 'dateAdded', label: 'Date Added', values: [
      { key: 'week', label: 'Last week' },
      { key: 'month', label: 'Last month' },
      { key: '3months', label: 'Last 3 months' },
      { key: 'year', label: 'Last year' },
    ],
  },
  {
    category: 'ageGroup', label: 'Age Group', values: [
      { key: 'neonate', label: 'Neonate (0–1m)' },
      { key: 'infant', label: 'Infant (1–12m)' },
      { key: 'toddler', label: 'Toddler (1–3y)' },
      { key: 'child', label: 'Child (3–12y)' },
      { key: 'adolescent', label: 'Adolescent (12–18y)' },
    ],
  },
  {
    category: 'specialty', label: 'Specialty', values: [
      { key: 'Cardiology', label: 'Cardiology' },
      { key: 'Neurology', label: 'Neurology' },
      { key: 'Respiratory', label: 'Respiratory' },
      { key: 'General', label: 'General' },
      { key: 'Gastroenterology', label: 'Gastroenterology' },
    ],
  },
];

const FilterChip = ({ label, options, selected, onSelect, align = 'left' }: {
  label: string;
  options: { key: string; label: string }[];
  selected: string | null;
  onSelect: (key: string) => void;
  align?: 'left' | 'right';
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selectedLabel = options.find(o => o.key === selected)?.label;
  const isActive = !!selected;

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen(prev => !prev)}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${
          isActive
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-card text-muted-foreground border-border hover:border-primary/50'
        }`}
      >
        {selectedLabel || label}
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          className={`absolute top-full mt-1.5 w-[200px] bg-card border border-border rounded-xl overflow-hidden ${align === 'right' ? 'right-0' : 'left-0'}`}
          style={{ zIndex: 9999, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
        >
          {options.map((o) => (
            <button
              key={o.key}
              onClick={() => { onSelect(o.key); setOpen(false); }}
              className={`w-full px-4 py-2.5 text-left text-[12px] transition-colors ${
                selected === o.key
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'text-foreground hover:bg-muted/50'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const PatientsScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string | null>>({});
  const navigate = useNavigate();

  const hasActiveFilters = Object.values(activeFilters).some(Boolean);

  const toggleFilter = (category: string, key: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [category]: prev[category] === key ? null : key,
    }));
  };

  const clearAll = () => setActiveFilters({});

  const filters: any = {};
  if (searchQuery) filters.search = searchQuery;
  if (activeFilters.dateAdded) filters.dateAdded = activeFilters.dateAdded;
  if (activeFilters.ageGroup) filters.ageGroup = activeFilters.ageGroup;
  if (activeFilters.specialty) filters.specialty = activeFilters.specialty;

  const { data: patients = [], isLoading } = usePatients(Object.keys(filters).length > 0 ? filters : undefined);

  return (
    <div className="px-5 py-6 space-y-5 animate-fade-in">
      {/* Search */}
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

      {/* Filter Chips */}
      <div className="flex items-center gap-2">
        <div className="flex gap-2 pb-1 flex-1" style={{ scrollbarWidth: 'none' }}>
          {filterOptions.map((group, index) => (
            <FilterChip
              key={group.category}
              label={group.label}
              options={group.values}
              selected={activeFilters[group.category] || null}
              onSelect={(key) => toggleFilter(group.category, key)}
              align={index === filterOptions.length - 1 ? 'right' : 'left'}
            />
          ))}
        </div>
        {hasActiveFilters && (
          <button onClick={clearAll} className="shrink-0 text-[11px] text-primary font-semibold">
            Clear All
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-bold text-foreground">{patients.length} Patients</h3>
        <button
          onClick={() => navigate('/case/new')}
          className="flex items-center gap-1 text-[12px] text-primary font-semibold"
        >
          <Plus size={14} /> Add New
        </button>
      </div>

      {/* Patient List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-primary" size={24} /></div>
        ) : (
          <>
            {patients.map((patient: any) => (
              <div
                key={patient.patientId || patient.id}
                onClick={() => navigate(`/patient/${patient.patientId || patient.id}`)}
                className="group p-3 bg-card border border-border rounded-xl active:scale-[0.98] transition-all cursor-pointer hover:shadow-card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl gradient-avatar flex items-center justify-center text-primary-foreground font-bold text-[14px] shadow-sm">
                      {getInitials(patient.name)}
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-foreground">{patient.name}</h4>
                      <p className="text-[11px] text-muted-foreground">
                        {patient.age >= 1 ? `${Math.floor(patient.age)}y` : `${Math.round(patient.age * 12)}m`} • {patient.gender} • {patient.caseCount ?? 0} cases
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="flex justify-end mt-1">
                  <span
                    className="text-[11px] font-bold"
                    style={{
                      borderRadius: 20,
                      padding: '3px 10px',
                      backgroundColor: patient.status === 'active' ? '#DCFCE7' : '#F1F5F9',
                      color: patient.status === 'active' ? '#16A34A' : '#64748B',
                    }}
                  >
                    {patient.status === 'active' ? 'Active' : 'Discharged'}
                  </span>
                </div>
              </div>
            ))}
            {patients.length === 0 && !isLoading && (
              <div className="py-10 text-center text-[13px] text-muted-foreground">No patients match the filters</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PatientsScreen;
