import React, { createContext, useContext, ReactNode } from 'react';
import { useWiseAIThreads } from '@/hooks/use-wise-ai-threads';
import { LocalThread } from '@/lib/local-thread-storage';

interface ThreadContextType {
  getThreads: () => Promise<LocalThread[]>;
  threads: LocalThread[];
  setThreads: React.Dispatch<React.SetStateAction<LocalThread[]>>;
  threadsLoading: boolean;
  setThreadsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const ThreadContext = createContext<ThreadContextType | undefined>(undefined);

export function WiseAIThreadProvider({ children }: { children: ReactNode }) {
  const wiseAIThreads = useWiseAIThreads();

  return (
    <ThreadContext.Provider value={wiseAIThreads}>
      {children}
    </ThreadContext.Provider>
  );
}

export function useThreads() {
  const context = useContext(ThreadContext);
  if (context === undefined) {
    throw new Error("useThreads must be used within a WiseAIThreadProvider");
  }
  return context;
}
