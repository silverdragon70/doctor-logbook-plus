import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Plus } from 'lucide-react';

const mockPatients = [
  { patientId: '1', name: 'Lucas Miller', age: 7, gender: 'male' as const, caseCount: 4, lastVisit: '2025-01-15', specialty: 'Respiratory', dateAdded: '2025-01-10' },
  { patientId: '2', name: 'Sophia Chen', age: 3, gender: 'female' as const, caseCount: 2, lastVisit: '2025-01-14', specialty: 'Cardiology', dateAdded: '2025-01-05' },
  { patientId: '3', name: 'Ethan Wright', age: 12, gender: 'male' as const, caseCount: 6, lastVisit: '2025-01-10', specialty: 'Neurology', dateAdded: '2024-12-20' },
  { patientId: '4', name: 'Maya Johnson', age: 5, gender: 'female' as const, caseCount: 1, lastVisit: '2025-01-08', specialty: 'General', dateAdded: '2024-11-15' },
  { patientId: '5', name: 'Noah Davis', age: 9, gender: 'male' as const, caseCount: 3, lastVisit: '2025-01-05', specialty: 'Gastroenterology', dateAdded: '2024-10-01' },
  { patientId: '6', name: 'Ava Thompson', age: 0.08, gender: 'female' as const, caseCount: 8, lastVisit: '2025-01-03', specialty: 'Cardiology', dateAdded: '2025-01-01' },
];

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

const matchesAgeGroup = (ageYears: number, key: string) => {
  const months = ageYears * 12;
  switch (key) {
    case 'neonate': return months >= 0 && months <= 1;
    case 'infant': return months > 1 && months <= 12;
    case 'toddler': return ageYears >= 1 && ageYears < 3;
    case 'child': return ageYears >= 3 && ageYears < 12;
    case 'adolescent': return ageYears >= 12 && ageYears <= 18;
    default: return true;
  }
};

const matchesDateAdded = (dateStr: string, key: string) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  switch (key) {
    case 'week': return diffDays <= 7;
    case 'month': return diffDays <= 30;
    case '3months': return diffDays <= 90;
    case 'year': return diffDays <= 365;
    default: return true;
  }
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

  const filtered = useMemo(() => {
    return mockPatients.filter(p => {
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (activeFilters.dateAdded && !matchesDateAdded(p.dateAdded, activeFilters.dateAdded)) return false;
      if (activeFilters.ageGroup && !matchesAgeGroup(p.age, activeFilters.ageGroup)) return false;
      if (activeFilters.specialty && p.specialty !== activeFilters.specialty) return false;
      return true;
    });
  }, [searchQuery, activeFilters]);

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
      <div className="space-y-2">
        <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {filterOptions.map((group) =>
            group.values.map((v) => {
              const isActive = activeFilters[group.category] === v.key;
              return (
                <button
                  key={`${group.category}-${v.key}`}
                  onClick={() => toggleFilter(group.category, v.key)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-muted-foreground border-border hover:border-primary/50'
                  }`}
                >
                  {v.label}
                </button>
              );
            })
          )}
        </div>
        {hasActiveFilters && (
          <button onClick={clearAll} className="text-[11px] text-primary font-semibold">
            Clear All
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-bold text-foreground">{filtered.length} Patients</h3>
        <button
          onClick={() => console.log('add patient')}
          className="flex items-center gap-1 text-[12px] text-primary font-semibold"
        >
          <Plus size={14} /> Add New
        </button>
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
            <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-10 text-center text-[13px] text-muted-foreground">No patients match the filters</div>
        )}
      </div>
    </div>
  );
};

export default PatientsScreen;
