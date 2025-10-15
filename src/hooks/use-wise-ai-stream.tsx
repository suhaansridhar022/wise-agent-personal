import { useState, useCallback, useEffect, useRef } from 'react';
import { Message } from '@langchain/langgraph-sdk';
import { callWiseAIAPI } from '@/lib/wise-ai-api';
import { 
  saveThreads, 
  loadThreads, 
  saveThreadMessages, 
  loadThreadMessages,
  createNewThread,
  updateThreadTitle,
  LocalThread,
  ThreadMessages
} from '@/lib/local-thread-storage';

export function useWiseAIStream(
  selectedModel?: string,
  baseUrl?: string,
  apiKey?: string,
  threadId?: string | null
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(threadId || null);

  // Track the previous thread ID to detect actual thread switches
  const prevThreadIdRef = useRef<string | null>(currentThreadId);
  const isSubmittingRef = useRef(false);

  // Load messages for current thread on mount or thread change
  useEffect(() => {
    // Don't reload if we're in the middle of submitting (prevents clearing during API call)
    if (isSubmittingRef.current) return;
    
    // Only reload if thread actually changed (not just state update)
    if (prevThreadIdRef.current === currentThreadId) return;
    
    if (currentThreadId) {
      const threadMessages = loadThreadMessages();
      const messages = threadMessages[currentThreadId] || [];
      setMessages(messages);
      console.log('Loaded thread:', currentThreadId, 'with', messages.length, 'messages');
    } else {
      setMessages([]);
      console.log('No thread selected, cleared messages');
    }
    
    prevThreadIdRef.current = currentThreadId;
  }, [currentThreadId]);

  // Sync with threadId prop changes
  useEffect(() => {
    if (threadId !== currentThreadId) {
      setCurrentThreadId(threadId);
    }
  }, [threadId, currentThreadId]);

  const submit = useCallback(async (
    input: { messages: Message[] },
    options?: any
  ) => {
    if (!selectedModel || !baseUrl || !apiKey) {
      console.error('Missing Wise AI configuration');
      return;
    }

    setIsLoading(true);
    setError(null);
    isSubmittingRef.current = true; // Mark that we're submitting

    try {
      // Create new thread if none exists
      let threadIdToUse = currentThreadId;
      if (!threadIdToUse) {
        const newThread = createNewThread('wise-ai'); // Mark as Wise AI thread
        const threads = loadThreads();
        threads.unshift(newThread); // Add to beginning
        saveThreads(threads);
        threadIdToUse = newThread.id;
        setCurrentThreadId(threadIdToUse);
        prevThreadIdRef.current = threadIdToUse; // Update ref immediately
      }

      // Add user messages to the chat
      const updatedMessages = [...messages, ...input.messages];
      setMessages(updatedMessages);

      // Call Wise AI API
      const response = await callWiseAIAPI(input.messages, selectedModel, baseUrl, apiKey);
      
      // Create AI message
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        type: "ai",
        content: response.choices[0]?.message?.content || "No response received",
      };

      // Add AI response to messages
      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);

      // Save messages to localStorage
      const threadMessages = loadThreadMessages();
      threadMessages[threadIdToUse] = finalMessages;
      saveThreadMessages(threadMessages);

      // Update thread title and metadata
      const threads = loadThreads();
      const threadIndex = threads.findIndex(t => t.id === threadIdToUse);
      if (threadIndex !== -1) {
        threads[threadIndex] = {
          ...threads[threadIndex],
          title: updateThreadTitle(threadIdToUse, finalMessages),
          updatedAt: new Date().toISOString(),
          messageCount: finalMessages.length,
          lastMessage: aiMessage.content.slice(0, 100)
        };
        saveThreads(threads);
      }
    } catch (err) {
      setError(err);
      console.error('Wise AI API Error:', err);
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false; // Mark that we're done submitting
    }
  }, [selectedModel, baseUrl, apiKey, currentThreadId, messages]);

  const stop = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Mock the getMessagesMetadata function that LangGraph provides
  const getMessagesMetadata = useCallback((message: any) => {
    return {
      firstSeenState: {
        values: { messages },
        parent_checkpoint: null
      }
    };
  }, [messages]);

  // Create new thread
  const createNewThreadHandler = useCallback(() => {
    const newThread = createNewThread('wise-ai'); // Mark as Wise AI thread
    const threads = loadThreads();
    threads.unshift(newThread);
    saveThreads(threads);
    setCurrentThreadId(newThread.id);
    setMessages([]);
  }, []);

  // Switch to thread
  const switchToThread = useCallback((threadId: string) => {
    setCurrentThreadId(threadId);
  }, []);

  return {
    messages,
    isLoading,
    error,
    submit,
    stop,
    getMessagesMetadata,
    createNewThread: createNewThreadHandler,
    currentThreadId,
    switchToThread,
    values: { messages, ui: [] },
    interrupt: null,
    ui: []
  };
}
