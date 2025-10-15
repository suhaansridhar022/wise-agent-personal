import { Message } from '@langchain/langgraph-sdk';

export type ThreadApiType = 'wise-ai' | 'langgraph';

export interface LocalThread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage?: string;
  apiType: ThreadApiType; // Track which API this thread belongs to
}

export interface ThreadMessages {
  [threadId: string]: Message[];
}

// Unified storage for all threads (both Wise AI and LangGraph)
const THREADS_STORAGE_KEY = 'unified-threads';
const THREAD_MESSAGES_STORAGE_KEY = 'unified-thread-messages';

export function saveThreads(threads: LocalThread[]): void {
  try {
    localStorage.setItem(THREADS_STORAGE_KEY, JSON.stringify(threads));
  } catch (error) {
    console.error('Failed to save threads:', error);
  }
}

export function loadThreads(): LocalThread[] {
  try {
    const stored = localStorage.getItem(THREADS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load threads:', error);
    return [];
  }
}

export function saveThreadMessages(threadMessages: ThreadMessages): void {
  try {
    localStorage.setItem(THREAD_MESSAGES_STORAGE_KEY, JSON.stringify(threadMessages));
  } catch (error) {
    console.error('Failed to save thread messages:', error);
  }
}

export function loadThreadMessages(): ThreadMessages {
  try {
    const stored = localStorage.getItem(THREAD_MESSAGES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Failed to load thread messages:', error);
    return {};
  }
}

export function createNewThread(apiType: ThreadApiType): LocalThread {
  const threadId = `thread-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  return {
    id: threadId,
    title: 'New Chat',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messageCount: 0,
    apiType // Store which API this thread uses
  };
}

export function updateThreadTitle(threadId: string, messages: Message[]): string {
  // Generate title from first user message
  const firstUserMessage = messages.find(msg => msg.type === 'human');
  if (firstUserMessage) {
    const content = Array.isArray(firstUserMessage.content) 
      ? firstUserMessage.content.map(c => c.type === 'text' ? c.text : '').join('')
      : firstUserMessage.content;
    
    // Take first 50 characters and clean up
    const title = content.slice(0, 50).trim();
    return title || 'New Chat';
  }
  return 'New Chat';
}

// Helper to sync LangGraph threads into unified storage
export function syncLangGraphThread(
  threadId: string,
  messages: Message[]
): void {
  const threads = loadThreads();
  const existingIndex = threads.findIndex(t => t.id === threadId);
  
  const threadData: LocalThread = {
    id: threadId,
    title: updateThreadTitle(threadId, messages),
    createdAt: existingIndex >= 0 ? threads[existingIndex].createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messageCount: messages.length,
    lastMessage: messages.length > 0 ? 
      (typeof messages[messages.length - 1].content === 'string' 
        ? messages[messages.length - 1].content.slice(0, 100)
        : '') : '',
    apiType: 'langgraph'
  };
  
  if (existingIndex >= 0) {
    threads[existingIndex] = threadData;
  } else {
    threads.unshift(threadData);
  }
  
  saveThreads(threads);
}
