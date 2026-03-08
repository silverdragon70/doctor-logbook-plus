import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Filter, Clock, FileText, Loader2 } from 'lucide-react';
import { useSearch, useRecentSearches, useSaveRecentSearch } from '@/hooks/useSearch';

const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'quick' | 'fulltext'>('quick');
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();

  const { data: results = [], isLoading } = useSearch(hasSearched ? query : '');
  const { data: recentSearches = [] } = useRecentSearches();
  const { mutate: saveSearch } = useSaveRecentSearch();

  const handleSearch = () => {
    if (query.trim()) {
      setHasSearched(true);
      saveSearch(query.trim());
    }
  };

  return (
    <div className="px-5 py-6 space-y-5 animate-fade-in">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input
          type="text"
          placeholder="Search diagnosis, patient, notes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="w-full h-12 pl-12 pr-10 bg-card border border-border rounded-2xl text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all shadow-card"
        />
        {query && (
          <button onClick={() => { setQuery(''); setHasSearched(false); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Search Type Toggle */}
      <div className="p-1 bg-muted rounded-xl flex gap-1">
        <button
          onClick={() => setSearchType('quick')}
          className={`flex-1 py-2 text-[13px] font-semibold rounded-lg transition-all ${
            searchType === 'quick' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'
          }`}
        >
          Quick (Diagnosis)
        </button>
        <button
          onClick={() => setSearchType('fulltext')}
          className={`flex-1 py-2 text-[13px] font-semibold rounded-lg transition-all ${
            searchType === 'fulltext' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'
          }`}
        >
          Full-Text
        </button>
      </div>

      {/* Results or Recent */}
      {!hasSearched ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock size={14} />
            <span className="text-[12px] font-semibold uppercase tracking-wider">Recent Searches</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(recentSearches as string[]).map((term: string) => (
              <button
                key={term}
                onClick={() => { setQuery(term); setHasSearched(true); }}
                className="px-3 py-1.5 bg-card border border-border rounded-full text-[12px] font-medium text-foreground hover:border-primary transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-foreground">
              {isLoading ? 'Searching...' : `${results.length} Results`}
            </h3>
            <button className="flex items-center gap-1 text-[12px] text-primary font-medium">
              <Filter size={12} /> Filter
            </button>
          </div>
          {isLoading ? (
            <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-primary" size={24} /></div>
          ) : (
            results.map((result: any) => (
              <div
                key={result.caseId || result.id}
                onClick={() => navigate(`/case/${result.caseId || result.id}`)}
                className="p-3 bg-card border border-border rounded-xl active:scale-[0.98] transition-all cursor-pointer hover:shadow-card"
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-[14px] font-bold text-foreground">{result.patientName || result.patient_name}</h4>
                  <span className="text-[10px] text-muted-foreground">{result.date || result.admission_date}</span>
                </div>
                <p className="text-[12px] text-primary font-semibold">{result.diagnosis}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{result.complaint || result.chief_complaint}</p>
                {(result.mediaCount || 0) > 0 && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                    <FileText size={10} /> {result.mediaCount} images
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchScreen;
