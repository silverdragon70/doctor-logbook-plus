import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Filter, Clock, FileText } from 'lucide-react';

const recentSearches = ['Bronchitis', 'Cardiac', 'Lucas Miller', 'Room 402'];

const searchResults = [
  { caseId: '1', patientName: 'Lucas Miller', diagnosis: 'Acute bronchitis', date: '2025-01-15', complaint: 'Persistent cough', mediaCount: 2 },
  { caseId: '5', patientName: 'Noah Davis', diagnosis: 'Bronchiolitis', date: '2025-01-05', complaint: 'Wheezing & cough', mediaCount: 0 },
  { caseId: '6', patientName: 'Ava Thompson', diagnosis: 'Reactive airway disease', date: '2025-01-03', complaint: 'Recurrent wheeze', mediaCount: 3 },
];

const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'quick' | 'fulltext'>('quick');
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();

  const handleSearch = () => {
    if (query.trim()) {
      setHasSearched(true);
      console.log('search', searchType, query);
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
            {recentSearches.map((term) => (
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
            <h3 className="text-[14px] font-bold text-foreground">{searchResults.length} Results</h3>
            <button className="flex items-center gap-1 text-[12px] text-primary font-medium">
              <Filter size={12} /> Filter
            </button>
          </div>
          {searchResults.map((result) => (
            <div
              key={result.caseId}
              onClick={() => navigate(`/case/${result.caseId}`)}
              className="p-3 bg-card border border-border rounded-xl active:scale-[0.98] transition-all cursor-pointer hover:shadow-card"
            >
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-[14px] font-bold text-foreground">{result.patientName}</h4>
                <span className="text-[10px] text-muted-foreground">{result.date}</span>
              </div>
              <p className="text-[12px] text-primary font-semibold">{result.diagnosis}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{result.complaint}</p>
              {result.mediaCount > 0 && (
                <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <FileText size={10} /> {result.mediaCount} images
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchScreen;
