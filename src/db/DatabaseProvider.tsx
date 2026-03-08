import React, { useEffect, useState } from 'react';
import { initDatabase } from './database';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface DatabaseProviderProps {
  children: React.ReactNode;
}

type DbState = 'loading' | 'ready' | 'error';

const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ children }) => {
  const [state, setState] = useState<DbState>('loading');
  const [error, setError] = useState<string>('');

  const initialize = async () => {
    setState('loading');
    setError('');
    try {
      await initDatabase();
      setState('ready');
    } catch (err) {
      console.error('Database initialization failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setState('error');
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  if (state === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <h1 className="text-2xl font-bold text-foreground mb-4">Medora</h1>
        <Loader2 className="animate-spin text-primary" size={32} />
        <p className="text-sm text-muted-foreground mt-3">Initializing...</p>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background px-6">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="text-destructive" size={28} />
        </div>
        <h1 className="text-lg font-bold text-foreground mb-2">Database Error</h1>
        <p className="text-sm text-muted-foreground text-center mb-4">{error}</p>
        <button
          onClick={initialize}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
        >
          <RefreshCw size={14} />
          Retry
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default DatabaseProvider;
