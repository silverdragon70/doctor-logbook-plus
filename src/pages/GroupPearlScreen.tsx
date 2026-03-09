import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, SearchX, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { generateGroupPearl } from '@/services/groupPearlService';
import type { GroupPearl } from '@/services/groupPearlService';

type TimePeriod = 'last_week' | 'last_month' | 'last_3_months' | 'last_6_months' | 'last_year' | 'all_time' | 'custom';
type Outcome = 'all' | 'active' | 'improved' | 'died';
type ScreenState = 'empty' | 'loading' | 'results' | 'error' | 'no_cases';

const timePeriodOptions: { value: TimePeriod; label: string; serviceValue: string }[] = [
  { value: 'last_week', label: 'Last Week', serviceValue: 'week' },
  { value: 'last_month', label: 'Last Month', serviceValue: 'month' },
  { value: 'last_3_months', label: 'Last 3 Months', serviceValue: '3months' },
  { value: 'last_6_months', label: 'Last 6 Months', serviceValue: '6months' },
  { value: 'last_year', label: 'Last Year', serviceValue: 'year' },
  { value: 'all_time', label: 'All Time', serviceValue: 'all' },
  { value: 'custom', label: 'Custom', serviceValue: 'custom' },
];

const outcomeOptions: { value: Outcome; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'improved', label: 'Improved' },
  { value: 'died', label: 'Died' },
];

const PillButton = ({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
      selected
        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
        : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
    )}
  >
    {children}
  </button>
);

const GroupPearlScreen = () => {
  const navigate = useNavigate();
  const [diagnosis, setDiagnosis] = useState('');
  const [timePeriod, setTimePeriod] = useState<TimePeriod | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [customFrom, setCustomFrom] = useState<Date | undefined>();
  const [customTo, setCustomTo] = useState<Date | undefined>();
  const [showValidation, setShowValidation] = useState(false);
  const [screenState, setScreenState] = useState<ScreenState>('empty');
  const [results, setResults] = useState<GroupPearl | null>(null);

  const hasFilters = diagnosis.trim() !== '' || timePeriod !== null || outcome !== null;

  const handleGenerate = async () => {
    if (!diagnosis.trim()) {
      setShowValidation(true);
      return;
    }
    setShowValidation(false);
    setScreenState('loading');

    const selectedPeriod = timePeriod ? timePeriodOptions.find(o => o.value === timePeriod)?.serviceValue ?? 'all' : 'all';
    const selectedOutcome = outcome ?? 'all';

    try {
      const pearl = await generateGroupPearl({
        diagnosis: diagnosis.trim(),
        timePeriod: selectedPeriod,
        outcome: selectedOutcome,
        fromDate: timePeriod === 'custom' && customFrom ? format(customFrom, 'yyyy-MM-dd') : undefined,
        toDate: timePeriod === 'custom' && customTo ? format(customTo, 'yyyy-MM-dd') : undefined,
      });
      setResults(pearl);
      setScreenState('results');
    } catch (err: any) {
      if (err?.message === 'NO_MATCHING_CASES') {
        setScreenState('no_cases');
      } else {
        setScreenState('error');
      }
    }
  };

  const getTimePeriodLabel = () => {
    if (!timePeriod) return null;
    if (timePeriod === 'custom') {
      const from = customFrom ? format(customFrom, 'MMM d') : '...';
      const to = customTo ? format(customTo, 'MMM d') : '...';
      return `${from} — ${to}`;
    }
    return timePeriodOptions.find((o) => o.value === timePeriod)?.label;
  };

  return (
    <div className="px-4 py-4 space-y-4 pb-24 animate-fade-in">
      {/* FILTER CARD */}
      <div className="bg-card rounded-[18px] shadow-card p-4 space-y-4 border border-border/50">
        <h2 className="text-sm font-semibold text-foreground">Filters</h2>

        {/* Diagnosis */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Diagnosis <span className="text-destructive">*</span></label>
          <Input
            placeholder="e.g. Bronchiolitis, Pneumonia..."
            value={diagnosis}
            onChange={(e) => { setDiagnosis(e.target.value); if (showValidation) setShowValidation(false); }}
            className="h-10 rounded-xl border-border bg-muted/30 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-primary focus-visible:border-primary"
          />
        </div>

        {/* Time Period */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Time Period</label>
          <div className="flex flex-wrap gap-1.5">
            {timePeriodOptions.map((opt) => (
              <PillButton
                key={opt.value}
                selected={timePeriod === opt.value}
                onClick={() => { setTimePeriod(timePeriod === opt.value ? null : opt.value); if (showValidation) setShowValidation(false); }}
              >
                {opt.label}
              </PillButton>
            ))}
          </div>
          {timePeriod === 'custom' && (
            <div className="flex gap-2 mt-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('flex-1 h-9 rounded-xl text-xs justify-start font-normal', !customFrom && 'text-muted-foreground')}>
                    {customFrom ? format(customFrom, 'MMM d, yyyy') : 'From'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={customFrom} onSelect={setCustomFrom} initialFocus className={cn('p-3 pointer-events-auto')} />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('flex-1 h-9 rounded-xl text-xs justify-start font-normal', !customTo && 'text-muted-foreground')}>
                    {customTo ? format(customTo, 'MMM d, yyyy') : 'To'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar mode="single" selected={customTo} onSelect={setCustomTo} initialFocus className={cn('p-3 pointer-events-auto')} />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        {/* Outcome */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Outcome</label>
          <div className="flex flex-wrap gap-1.5">
            {outcomeOptions.map((opt) => (
              <PillButton
                key={opt.value}
                selected={outcome === opt.value}
                onClick={() => { setOutcome(outcome === opt.value ? null : opt.value); if (showValidation) setShowValidation(false); }}
              >
                {opt.label}
              </PillButton>
            ))}
          </div>
        </div>

        {showValidation && !diagnosis.trim() && (
          <div className="flex items-center gap-2 bg-destructive/10 text-destructive rounded-xl px-3 py-2.5 text-xs font-medium animate-fade-in">
            <AlertCircle size={14} />
            Please enter a diagnosis to analyze
          </div>
        )}

        <Button
          onClick={handleGenerate}
          disabled={screenState === 'loading'}
          className={cn(
            'w-full h-11 rounded-xl text-sm font-semibold transition-all',
            hasFilters ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-brand' : 'bg-muted text-muted-foreground cursor-not-allowed'
          )}
        >
          {screenState === 'loading' ? <Loader2 className="animate-spin mr-2" size={16} /> : <span className="mr-1.5">💡</span>}
          {screenState === 'loading' ? 'Analyzing...' : 'Generate Clinical Pearls'}
        </Button>
      </div>

      {/* LOADING STATE */}
      {screenState === 'loading' && (
        <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Loader2 className="animate-spin text-primary" size={28} />
          </div>
          <p className="text-sm font-semibold text-foreground">Analyzing cases...</p>
          <p className="text-xs text-muted-foreground mt-1">Fetching patterns & latest guidelines</p>
        </div>
      )}

      {/* ERROR STATE */}
      {screenState === 'error' && (
        <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertCircle className="text-destructive" size={28} />
          </div>
          <p className="text-sm font-semibold text-foreground">Something went wrong</p>
          <p className="text-xs text-muted-foreground mt-1 text-center px-8">Could not complete analysis. Please check your AI settings and try again.</p>
          <Button variant="outline" size="sm" className="mt-4 rounded-xl gap-2" onClick={() => setScreenState('empty')}>
            <RefreshCw size={14} /> Try Again
          </Button>
        </div>
      )}

      {/* NO CASES STATE */}
      {screenState === 'no_cases' && (
        <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <SearchX className="text-muted-foreground" size={28} />
          </div>
          <p className="text-sm font-semibold text-foreground">No cases found</p>
          <p className="text-xs text-muted-foreground mt-1 text-center px-8">No matching cases for the selected filters. Try adjusting your criteria.</p>
        </div>
      )}

      {/* RESULTS */}
      {screenState === 'results' && results && (
        <div className="space-y-3 animate-fade-in">
          {/* Summary Card */}
          <div className="bg-card rounded-[18px] shadow-card p-4 border border-border/50 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Summary</h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {diagnosis && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">{diagnosis}</span>
              )}
              {getTimePeriodLabel() && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">{getTimePeriodLabel()}</span>
              )}
              {outcome && outcome !== 'all' && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium capitalize">{outcome}</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{results.summary}</p>
          </div>

          {/* Common Patterns Card */}
          {Array.isArray(results.patterns) && results.patterns.length > 0 && (
            <div className="bg-card rounded-[18px] shadow-card p-4 border border-border/50 space-y-3">
              <h3 className="text-sm font-bold text-foreground">📊 Common Patterns</h3>
              <ul className="space-y-2">
                {results.patterns.map((pattern, i) => (
                  <li key={i} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {pattern}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Comparison Card */}
          {results.comparison && (
            <div className="bg-card rounded-[18px] shadow-card p-4 border border-border/50 space-y-3">
              <h3 className="text-sm font-bold text-foreground">⚖️ Comparison</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{results.comparison}</p>
            </div>
          )}

          {/* Clinical Pearl Card */}
          {results.pearl && (
            <div className="bg-card rounded-[18px] shadow-card p-4 border border-border/50 space-y-3">
              <h3 className="text-sm font-bold text-foreground">💡 Clinical Pearl</h3>
              <div className="rounded-xl bg-accent/50 border-l-[3px] border-l-primary p-3">
                <p className="text-xs text-foreground/80 leading-relaxed">{results.pearl}</p>
              </div>
            </div>
          )}

          {/* Disease Review Card */}
          {results.diseaseReview && (
            <div className="bg-card rounded-[18px] shadow-card p-4 border border-border/50 space-y-3">
              <h3 className="text-sm font-bold text-foreground">🌐 Disease Review</h3>
              <div className="rounded-xl bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground leading-relaxed">{results.diseaseReview}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GroupPearlScreen;
