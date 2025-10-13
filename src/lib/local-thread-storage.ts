import { Message } from '@langchain/langgraph-sdk';

export interface LocalThread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage?: string;
}

export interface ThreadMessages {
  [threadId: string]: Message[];
}

const THREADS_STORAGE_KEY = 'wise-ai-threads';
const THREAD_MESSAGES_STORAGE_KEY = 'wise-ai-thread-messages';

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

export function createNewThread(): LocalThread {
  const threadId = `thread-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  return {
    id: threadId,
    title: 'New Chat',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messageCount: 0
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
