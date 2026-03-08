import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, BookOpen, GraduationCap, ChevronRight, Lightbulb } from 'lucide-react';
import { useProcedureStats } from '@/hooks/useProcedures';
import { useLectures } from '@/hooks/useLectures';
import { useCourses } from '@/hooks/useCourses';

const LogbookScreen = () => {
  const navigate = useNavigate();
  const { data: procedureStats } = useProcedureStats();
  const { data: lectures } = useLectures();
  const { data: courses } = useCourses();

  const pStats = procedureStats ?? { performed: 0, assisted: 0, observed: 0 };
  const lecturesCount = lectures?.length ?? 0;
  const coursesCount = courses?.length ?? 0;

  const logbookCards = [
    {
      id: 'procedures',
      title: 'Procedures',
      icon: Stethoscope,
      stats: [
        { label: 'Performed', value: pStats.performed },
        { label: 'Assisted', value: pStats.assisted },
        { label: 'Observed', value: pStats.observed },
      ],
      color: 'primary',
    },
    {
      id: 'lectures',
      title: 'Lectures',
      icon: BookOpen,
      stats: [{ label: 'Attended', value: lecturesCount }],
      color: 'secondary',
    },
    {
      id: 'courses',
      title: 'Courses',
      icon: GraduationCap,
      stats: [{ label: 'Completed', value: coursesCount }],
      color: 'accent',
    },
  ];

  return (
    <div className="px-5 py-6 space-y-4 animate-fade-in">
      <div className="mb-2">
        <h2 className="text-[22px] font-bold text-foreground">Logbook</h2>
        <p className="text-sm text-muted-foreground mt-1">Track your clinical activities</p>
      </div>

      {logbookCards.map((card) => (
        <button
          key={card.id}
          onClick={() => {
            const routes: Record<string, string> = { procedures: '/procedures', lectures: '/lectures', courses: '/courses' };
            navigate(routes[card.id] || '/logbook');
          }}
          className="w-full bg-card rounded-2xl border border-border shadow-card p-5 flex items-center gap-4 active:scale-[0.98] transition-all duration-150 hover:shadow-elevated text-left group"
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            card.color === 'primary' ? 'bg-primary/10 text-primary' :
            card.color === 'secondary' ? 'bg-secondary/10 text-secondary' :
            'bg-accent text-accent-foreground'
          }`}>
            <card.icon size={24} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-foreground">{card.title}</h3>
            <div className="flex flex-col gap-1 mt-1.5">
              {card.stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-1.5">
                  <span className="text-sm font-bold font-mono-stats text-foreground">{stat.value}</span>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <ChevronRight size={18} className="text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </button>
      ))}

      {/* Clinical Pearls Card */}
      <button
        onClick={() => navigate('/group-pearl')}
        className="w-full bg-card rounded-2xl border border-border shadow-card p-5 flex items-center gap-4 active:scale-[0.98] transition-all duration-150 hover:shadow-elevated text-left group"
      >
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#FEF3C7' }}>
          <Lightbulb size={24} style={{ color: '#D97706' }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground">Clinical Pearls</h3>
          <p className="text-xs text-muted-foreground mt-1">Analyze your cases</p>
        </div>
        <ChevronRight size={18} className="text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
};

export default LogbookScreen;
