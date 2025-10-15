# 🚀 API Flow Documentation - Wise AI Gateway Integration

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Key Components](#key-components)
4. [API Flow - Step by Step](#api-flow---step-by-step)
5. [Code Changes Made](#code-changes-made)
6. [Configuration](#configuration)
7. [Thread Management](#thread-management)

---

## Overview

Your application now supports **two different API systems**:
1. **LangGraph API** - Original system for graph-based workflows
2. **Wise AI Gateway** - OpenAI-compatible API for direct model access

The system **automatically detects** which API to use based on your model selection.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         User Input                          │
│              (Types message and clicks Send)                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Thread Component                         │
│              (src/components/thread/index.tsx)              │
│                                                             │
│  • Collects user message                                   │
│  • Checks which API to use (shouldUseWiseAI)               │
│  • Calls stream.submit() with message                      │
└────────────────────────┬────────────────────────────────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
    ┌─────────────────┐   ┌─────────────────┐
    │   Wise AI API   │   │  LangGraph API  │
    │   (if model     │   │  (if graph or   │
    │   selected)     │   │   default)      │
    └────────┬────────┘   └────────┬────────┘
             │                     │
             ▼                     ▼
┌──────────────────────┐ ┌──────────────────────┐
│  useWiseAIStream     │ │  LangGraph SDK       │
│  Hook                │ │  useStream Hook      │
│                      │ │                      │
│ • Manages messages   │ │ • Manages messages   │
│ • Calls Wise AI API  │ │ • Calls LangGraph    │
│ • Saves to          │ │ • Server manages     │
│   localStorage      │ │   threads            │
└──────────┬───────────┘ └──────────┬───────────┘
           │                        │
           ▼                        ▼
┌──────────────────────┐ ┌──────────────────────┐
│ Wise AI Gateway      │ │ LangGraph Server     │
│ Backend              │ │ Backend              │
│                      │ │                      │
│ URL: backend-ai-     │ │ URL: localhost:2024  │
│ gateway-dev.         │ │                      │
│ wisseninfotech.com   │ │                      │
└──────────────────────┘ └──────────────────────┘
```

---

## Key Components

### 1. **Settings Context** (`src/context/SettingsContext.tsx`)
**Purpose:** Stores your API configuration

**What it stores:**
```typescript
{
  // Model Provider (Wise AI) Settings
  modelProviderBaseUrl: "https://backend-ai-gateway-dev.wisseninfotech.com",
  modelProviderApiKey: "sk-fSa_LTlOePpKhkq_5UI-Fw",
  models: ["Wise_AI_gpt_4.1_nano"],
  selectedModel: "Wise_AI_gpt_4.1_nano",
  apiType: "model", // or "graph" or null
  
  // LangGraph Settings
  langGraphUrl: "http://localhost:2024",
  langGraphApiKey: "...",
  langGraphAssistantId: "agent"
}
```

**Storage:** All settings are saved to `localStorage` and persist across browser refreshes.

---

### 2. **Stream Provider** (`src/providers/Stream.tsx`)
**Purpose:** Determines which API system to use and provides the appropriate context

**Key Logic:**
```typescript
// Check if we should use Wise AI
const shouldUseWiseAI = selectedModel && (
  apiType === 'model' || 
  isWiseAIModel(selectedModel) ||  // Contains "wise_ai"
  isWiseAIUrl(modelProviderBaseUrl) // Contains "wisseninfotech.com"
);

// Use appropriate stream hook
if (shouldUseWiseAI) {
  // Use Wise AI custom hook
  const wiseAIStream = useWiseAIStream(selectedModel, baseUrl, apiKey, threadId);
  return <StreamContext.Provider value={wiseAIStream}>...</StreamContext.Provider>
} else {
  // Use LangGraph SDK
  return <StreamSession apiUrl={...} apiKey={...}>...</StreamSession>
}
```

**What it does:**
- ✅ Detects which API to use based on settings
- ✅ Provides the correct stream context to child components
- ✅ No LangGraph connection if using Wise AI (avoids errors)

---

### 3. **Wise AI Stream Hook** (`src/hooks/use-wise-ai-stream.tsx`)
**Purpose:** Manages messages and API calls for Wise AI

**What it does:**
```typescript
export function useWiseAIStream(selectedModel, baseUrl, apiKey, threadId) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const submit = async (input) => {
    // 1. Create thread if needed
    if (!threadId) {
      const newThread = createNewThread();
      saveToLocalStorage(newThread);
    }
    
    // 2. Add user message to state
    setMessages(prev => [...prev, ...input.messages]);
    
    // 3. Call Wise AI API
    const response = await callWiseAIAPI(input.messages, selectedModel, baseUrl, apiKey);
    
    // 4. Add AI response to state
    setMessages(prev => [...prev, aiMessage]);
    
    // 5. Save everything to localStorage
    saveThreadMessages(threadId, messages);
    updateThreadMetadata(threadId);
  };
  
  return { messages, isLoading, submit, ... };
}
```

**Key Features:**
- ✅ Automatic thread creation
- ✅ Message persistence in localStorage
- ✅ Handles API calls to Wise AI Gateway

---

### 4. **Wise AI API Utility** (`src/lib/wise-ai-api.ts`)
**Purpose:** Makes the actual HTTP request to Wise AI Gateway

**The API Call:**
```typescript
export async function callWiseAIAPI(
  messages: Message[],
  model: string,
  apiUrl: string,
  apiKey: string
): Promise<WiseAIResponse> {
  
  // Convert LangGraph message format to OpenAI format
  const openAIMessages = messages.map(msg => ({
    role: msg.type === "human" ? "user" : "assistant",
    content: extractTextContent(msg.content)
  }));
  
  // Make HTTP POST request
  const response = await fetch(`${apiUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,              // "Wise_AI_gpt_4.1_nano"
      messages: openAIMessages,
      max_tokens: 1000,
      temperature: 0.7,
    })
  });
  
  return await response.json();
}
```

**Request Example:**
```http
POST https://backend-ai-gateway-dev.wisseninfotech.com/chat/completions
Authorization: Bearer sk-fSa_LTlOePpKhkq_5UI-Fw
Content-Type: application/json

{
  "model": "Wise_AI_gpt_4.1_nano",
  "messages": [
    { "role": "user", "content": "Hello, how are you?" }
  ],
  "max_tokens": 1000,
  "temperature": 0.7
}
```

**Response Example:**
```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "Wise_AI_gpt_4.1_nano",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "I'm doing well, thank you! How can I help you today?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 15,
    "total_tokens": 25
  }
}
```

---

### 5. **Thread Component** (`src/components/thread/index.tsx`)
**Purpose:** Main chat interface where users type messages

**The Flow:**
```typescript
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  
  // 1. Create message object
  const newHumanMessage: Message = {
    id: uuidv4(),
    type: "human",
    content: [{ type: "text", text: input }]
  };
  
  // 2. Detect which API to use
  const shouldUseWiseAI = selectedModel && (
    apiType === 'model' || 
    isWiseAIModel(selectedModel) || 
    isWiseAIUrl(modelProviderBaseUrl)
  );
  
  // 3. Submit to appropriate API
  if (shouldUseWiseAI) {
    // Calls useWiseAIStream's submit method
    stream.submit(
      { messages: [newHumanMessage] },
      { streamMode: ["values"] }
    );
  } else {
    // Calls LangGraph SDK's submit method
    stream.submit(
      { messages: [newHumanMessage], context: {...} },
      { streamMode: ["values"], streamSubgraphs: true }
    );
  }
  
  // 4. Clear input
  setInput("");
};
```

---

## API Flow - Step by Step

### 🎯 When You Send a Message with Wise AI Model Selected:

**Step 1: User Types Message**
```
User Input: "Hello, what is 2+2?"
```

**Step 2: Thread Component Processes Input**
```typescript
// File: src/components/thread/index.tsx
const newHumanMessage = {
  id: "msg-12345",
  type: "human",
  content: [{ type: "text", text: "Hello, what is 2+2?" }]
};
```

**Step 3: Detection System Activates**
```typescript
// File: src/components/thread/index.tsx
const shouldUseWiseAI = 
  selectedModel === "Wise_AI_gpt_4.1_nano" && // ✅ True
  apiType === 'model';                         // ✅ True

// Result: shouldUseWiseAI = true
```

**Step 4: Calls Wise AI Stream Hook**
```typescript
// File: src/hooks/use-wise-ai-stream.tsx
stream.submit({ messages: [newHumanMessage] });

// Inside the hook:
const submit = async (input) => {
  // 4a. Create thread if first message
  if (!currentThreadId) {
    const newThread = {
      id: "thread-1697123456789-abc",
      title: "New Chat",
      createdAt: "2025-10-14T12:00:00Z"
    };
    saveThreads([newThread, ...existingThreads]);
    setCurrentThreadId(newThread.id);
  }
  
  // 4b. Update UI immediately (optimistic update)
  setMessages(prev => [...prev, newHumanMessage]);
  
  // 4c. Call the API...
};
```

**Step 5: Makes HTTP Request to Wise AI Gateway**
```typescript
// File: src/lib/wise-ai-api.ts
const response = await fetch(
  'https://backend-ai-gateway-dev.wisseninfotech.com/chat/completions',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer sk-fSa_LTlOePpKhkq_5UI-Fw',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'Wise_AI_gpt_4.1_nano',
      messages: [
        { role: 'user', content: 'Hello, what is 2+2?' }
      ],
      max_tokens: 1000,
      temperature: 0.7
    })
  }
);
```

**Step 6: Receives Response**
```javascript
// Response from Wise AI Gateway:
{
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "Hello! 2+2 equals 4."
    }
  }]
}
```

**Step 7: Processes Response**
```typescript
// File: src/hooks/use-wise-ai-stream.tsx
const aiMessage = {
  id: "ai-1697123456790",
  type: "ai",
  content: "Hello! 2+2 equals 4."
};

// Update UI with AI response
setMessages(prev => [...prev, aiMessage]);
```

**Step 8: Saves to localStorage**
```typescript
// File: src/hooks/use-wise-ai-stream.tsx
// Save messages
localStorage.setItem('wise-ai-thread-messages', JSON.stringify({
  "thread-1697123456789-abc": [
    { type: "human", content: "Hello, what is 2+2?" },
    { type: "ai", content: "Hello! 2+2 equals 4." }
  ]
}));

// Update thread metadata
localStorage.setItem('wise-ai-threads', JSON.stringify([
  {
    id: "thread-1697123456789-abc",
    title: "Hello, what is 2+2?", // Auto-generated from first message
    updatedAt: "2025-10-14T12:00:05Z",
    messageCount: 2,
    lastMessage: "Hello! 2+2 equals 4."
  }
]));
```

**Step 9: UI Updates**
```
Chat Display:
┌─────────────────────────────────────┐
│ You: Hello, what is 2+2?           │
│ AI:  Hello! 2+2 equals 4.          │
└─────────────────────────────────────┘

Thread History:
┌─────────────────────────────────────┐
│ 📝 Hello, what is 2+2?             │
│    Oct 14, 2025                    │
│    Hello! 2+2 equals 4.            │
└─────────────────────────────────────┘
```

---

## Code Changes Made

### 📝 Summary of All Changes

#### 1. **Added API Type Detection** (`src/context/SettingsContext.tsx`)
```typescript
// NEW: Added apiType to settings
{
  apiType: 'model' | 'graph' | null,
  setApiType: (type) => void
}
```

#### 2. **Created Wise AI API Utility** (`src/lib/wise-ai-api.ts`)
- **NEW FILE**
- Makes HTTP requests to Wise AI Gateway
- Converts message formats (LangGraph ↔ OpenAI)

#### 3. **Created Custom Stream Hook** (`src/hooks/use-wise-ai-stream.tsx`)
- **NEW FILE**
- Manages Wise AI messages and state
- Handles thread creation and persistence
- Calls Wise AI API

#### 4. **Created Thread Storage** (`src/lib/local-thread-storage.ts`)
- **NEW FILE**
- Save/load threads from localStorage
- Thread metadata management

#### 5. **Created Thread Hooks** (`src/hooks/use-wise-ai-threads.tsx`)
- **NEW FILE**
- Manages thread list for Wise AI

#### 6. **Created Thread Provider** (`src/providers/WiseAIThreadProvider.tsx`)
- **NEW FILE**
- Context provider for Wise AI threads

#### 7. **Updated Stream Provider** (`src/providers/Stream.tsx`)
```typescript
// ADDED: Detection logic
const shouldUseWiseAI = selectedModel && (
  apiType === 'model' || 
  isWiseAIModel(selectedModel) || 
  isWiseAIUrl(modelProviderBaseUrl)
);

// ADDED: Conditional rendering
if (shouldUseWiseAI) {
  return useWiseAIStream(...);
} else {
  return useLangGraphStream(...);
}
```

#### 8. **Updated Thread Component** (`src/components/thread/index.tsx`)
```typescript
// MODIFIED: handleSubmit function
if (shouldUseWiseAI) {
  stream.submit({ messages: [...] });  // Wise AI
} else {
  stream.submit({ messages: [...], context: {...} });  // LangGraph
}
```

#### 9. **Updated UI Dropdown** (`src/components/thread/index.tsx`)
```tsx
// MODIFIED: Model selection dropdown
<select>
  <option value="">Default (LangGraph)</option>
  <optgroup label="🤖 Models (Wise AI)">
    {models.map(m => <option>{m}</option>)}
  </optgroup>
  <optgroup label="📊 Graphs (LangGraph)">
    <option>Agent</option>
    <option>Research Assistant</option>
  </optgroup>
</select>
```

#### 10. **Updated Thread History** (`src/components/thread/history/`)
- **NEW FILE:** `WiseAIThreadList.tsx`
- **MODIFIED:** `index.tsx` to support both thread types

---

## Configuration

### How to Configure Wise AI Gateway:

**Step 1: Open Settings Panel**
- Click the ⚙️ icon in the chat interface

**Step 2: Navigate to "Model Provider" Tab**

**Step 3: Enter Your Credentials**
```
Base URL:    https://backend-ai-gateway-dev.wisseninfotech.com
API Key:     sk-fSa_LTlOePpKhkq_5UI-Fw
```

**Step 4: Add Your Model**
```
Model Name:  Wise_AI_gpt_4.1_nano
Click: [Add]
```

**Step 5: Save Settings**
- Click [Save Changes]

### Configuration is Stored in localStorage:
```javascript
localStorage.getItem('settings:mp:baseUrl');     // Base URL
localStorage.getItem('settings:mp:apiKey');      // API Key
localStorage.getItem('settings:mp:models');      // ["Wise_AI_gpt_4.1_nano"]
localStorage.getItem('settings:mp:selectedModel'); // Current selection
localStorage.getItem('settings:api:type');       // "model" or "graph"
```

---

## Thread Management

### How Threads Work:

#### **For Wise AI (Local Storage):**
```javascript
// Threads are stored in browser
localStorage.setItem('wise-ai-threads', JSON.stringify([
  {
    id: "thread-123",
    title: "Hello, what is 2+2?",
    createdAt: "2025-10-14T12:00:00Z",
    updatedAt: "2025-10-14T12:00:05Z",
    messageCount: 2,
    lastMessage: "Hello! 2+2 equals 4."
  }
]));

// Messages are stored separately
localStorage.setItem('wise-ai-thread-messages', JSON.stringify({
  "thread-123": [
    { type: "human", content: "Hello, what is 2+2?" },
    { type: "ai", content: "Hello! 2+2 equals 4." }
  ]
}));
```

#### **Thread Operations:**

**Create New Thread:**
```typescript
// When you click "New Thread" button
const newThread = {
  id: `thread-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  title: "New Chat",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  messageCount: 0
};
```

**Switch Thread:**
```typescript
// When you click a thread in sidebar
setCurrentThreadId("thread-123");
// Loads messages from localStorage for that thread
```

**Auto-Title Generation:**
```typescript
// Title is generated from first user message
const title = firstUserMessage.content.slice(0, 50).trim();
// "Hello, what is 2+2?"
```

---

## Key Differences: Wise AI vs LangGraph

| Feature | Wise AI | LangGraph |
|---------|---------|-----------|
| **API Format** | OpenAI-compatible | LangGraph-specific |
| **Endpoint** | `/chat/completions` | `/assistants/{id}/threads/{id}/runs` |
| **Authorization** | `Bearer` token | `X-Api-Key` header |
| **Thread Storage** | localStorage (client-side) | Server-side database |
| **Message Format** | `{role, content}` | `{type, content}` |
| **Streaming** | Not implemented | Supported |
| **Tool Calls** | Not implemented | Supported |
| **Subgraphs** | Not applicable | Supported |

---

## Troubleshooting

### Issue: "Connection Refused" Error
**Cause:** Trying to connect to LangGraph when using Wise AI  
**Solution:** Code now prevents this - only connects to LangGraph when needed

### Issue: "threads is not defined"
**Cause:** ThreadProvider context not available for Wise AI  
**Solution:** Code now uses try-catch and local state for Wise AI threads

### Issue: Messages not showing
**Cause:** Stream context missing methods  
**Solution:** Added `getMessagesMetadata()` method to Wise AI stream

### Issue: Threads not persisting
**Cause:** Not saved to localStorage  
**Solution:** Implemented automatic localStorage saves on every message

---

## Summary

### What Happens When You Select a Wise AI Model:

1. ✅ **Settings stored** → localStorage
2. ✅ **Provider detects** → "Use Wise AI"
3. ✅ **Stream switches** → useWiseAIStream hook
4. ✅ **No LangGraph connection** → Avoids errors
5. ✅ **Messages sent to** → Wise AI Gateway
6. ✅ **API format** → OpenAI-compatible
7. ✅ **Responses stored** → localStorage
8. ✅ **Threads managed** → Client-side
9. ✅ **UI updates** → Shows messages and threads

### The Beauty of This Implementation:

- 🎯 **Zero Configuration for Users** - Just select a model
- 🔄 **Automatic Detection** - Smart routing based on selection
- 💾 **Persistent Storage** - Threads survive page refresh
- 🚀 **No Backend Needed** - For Wise AI threads
- 🔌 **Pluggable Architecture** - Easy to add more APIs
- ✨ **Seamless UX** - Same interface for both APIs

---

## Files Reference

### New Files Created:
1. `src/lib/wise-ai-api.ts` - API utility
2. `src/hooks/use-wise-ai-stream.tsx` - Stream hook
3. `src/lib/local-thread-storage.ts` - Storage utility
4. `src/hooks/use-wise-ai-threads.tsx` - Thread hook
5. `src/providers/WiseAIThreadProvider.tsx` - Provider
6. `src/components/thread/history/WiseAIThreadList.tsx` - UI component

### Modified Files:
1. `src/context/SettingsContext.tsx` - Added apiType
2. `src/providers/Stream.tsx` - Added detection logic
3. `src/components/thread/index.tsx` - Updated submit handler
4. `src/components/thread/history/index.tsx` - Dual thread support
5. `src/app/page.tsx` - Smart provider rendering

---

**🎉 You now have a fully functional hybrid API system that seamlessly works with both Wise AI Gateway and LangGraph!**
