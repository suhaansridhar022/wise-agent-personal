/**
 * Migration utility to convert old thread storage to unified format
 * Run this once to migrate existing threads
 */

import { LocalThread } from './local-thread-storage';

const OLD_WISE_AI_THREADS_KEY = 'wise-ai-threads';
const OLD_WISE_AI_MESSAGES_KEY = 'wise-ai-thread-messages';
const NEW_THREADS_KEY = 'unified-threads';
const NEW_MESSAGES_KEY = 'unified-thread-messages';

export function migrateThreadsToUnified(): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Check if migration already done
    const existingUnified = localStorage.getItem(NEW_THREADS_KEY);
    if (existingUnified) {
      console.log('Unified threads already exist, skipping migration');
      return;
    }
    
    // Get old Wise AI threads
    const oldWiseAIThreadsStr = localStorage.getItem(OLD_WISE_AI_THREADS_KEY);
    const oldWiseAIMessagesStr = localStorage.getItem(OLD_WISE_AI_MESSAGES_KEY);
    
    if (oldWiseAIThreadsStr) {
      const oldThreads = JSON.parse(oldWiseAIThreadsStr);
      
      // Add apiType to each thread
      const migratedThreads: LocalThread[] = oldThreads.map((thread: any) => ({
        ...thread,
        apiType: 'wise-ai' as const
      }));
      
      // Save to new location
      localStorage.setItem(NEW_THREADS_KEY, JSON.stringify(migratedThreads));
      console.log(`Migrated ${migratedThreads.length} Wise AI threads to unified storage`);
    }
    
    if (oldWiseAIMessagesStr) {
      // Copy messages to new location
      localStorage.setItem(NEW_MESSAGES_KEY, oldWiseAIMessagesStr);
      console.log('Migrated Wise AI messages to unified storage');
    }
    
    console.log('Thread migration completed successfully!');
  } catch (error) {
    console.error('Failed to migrate threads:', error);
  }
}

// Auto-run migration on import
if (typeof window !== 'undefined') {
  migrateThreadsToUnified();
}

