import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Plus } from 'lucide-react';

const mockPatients = [
  { patientId: '1', name: 'Lucas Miller', age: 7, gender: 'male' as const, caseCount: 4, lastVisit: '2025-01-15' },
  { patientId: '2', name: 'Sophia Chen', age: 3, gender: 'female' as const, caseCount: 2, lastVisit: '2025-01-14' },
  { patientId: '3', name: 'Ethan Wright', age: 12, gender: 'male' as const, caseCount: 6, lastVisit: '2025-01-10' },
  { patientId: '4', name: 'Maya Johnson', age: 5, gender: 'female' as const, caseCount: 1, lastVisit: '2025-01-08' },
  { patientId: '5', name: 'Noah Davis', age: 9, gender: 'male' as const, caseCount: 3, lastVisit: '2025-01-05' },
  { patientId: '6', name: 'Ava Thompson', age: 2, gender: 'female' as const, caseCount: 8, lastVisit: '2025-01-03' },
];

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

const PatientsScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filtered = mockPatients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                  {patient.age}y • {patient.gender} • {patient.caseCount} cases
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientsScreen;
