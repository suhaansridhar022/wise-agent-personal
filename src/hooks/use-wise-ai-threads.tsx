import { useState, useCallback, useEffect } from 'react';
import { 
  saveThreads, 
  loadThreads, 
  LocalThread 
} from '@/lib/local-thread-storage';

export function useWiseAIThreads() {
  const [threads, setThreads] = useState<LocalThread[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(false);

  // Load threads on mount
  useEffect(() => {
    const loadedThreads = loadThreads();
    setThreads(loadedThreads);
  }, []);

  const getThreads = useCallback(async (): Promise<LocalThread[]> => {
    setThreadsLoading(true);
    try {
      const loadedThreads = loadThreads();
      setThreads(loadedThreads);
      return loadedThreads;
    } finally {
      setThreadsLoading(false);
    }
  }, []);

  const updateThreads = useCallback((newThreads: LocalThread[]) => {
    setThreads(newThreads);
    saveThreads(newThreads);
  }, []);

  return {
    threads,
    setThreads: updateThreads,
    threadsLoading,
    setThreadsLoading,
    getThreads
  };
}
