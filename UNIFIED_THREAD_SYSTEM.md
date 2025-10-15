# Unified Thread System Documentation

## Overview

The application now features a **unified thread management system** that displays both **Wise AI** and **LangGraph** threads together in a single list, with clear visual indicators and thread locking to prevent API type mismatches.

## Key Features

### 1. **Unified Thread Storage** 
All threads (both Wise AI and LangGraph) are now stored together in `localStorage` under a single key:
- **Storage Key**: `unified-threads`
- **Messages Key**: `unified-thread-messages`

### 2. **API Type Tracking**
Each thread now has an `apiType` field that identifies which API it belongs to:
```typescript
export type ThreadApiType = 'wise-ai' | 'langgraph';

export interface LocalThread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage?: string;
  apiType: ThreadApiType; // 'wise-ai' or 'langgraph'
}
```

### 3. **Visual Indicators (Badges)**
Each thread in the list displays a colored badge indicating its API type:

- **Wise AI Threads**: 
  - 🤖 Blue badge with "Wise AI" label
  - `bg-blue-500` background color
  
- **LangGraph Threads**: 
  - ⚡ Purple badge with "LangGraph" label
  - `bg-purple-500` background color

### 4. **Thread Locking**
Once a thread is created with a specific API type, it **cannot be used** with a different API:

- **Scenario 1**: User creates a thread with Wise AI model
  - Thread is marked as `apiType: 'wise-ai'`
  - If user switches to LangGraph assistant, this thread becomes **disabled**
  - Clicking the thread shows an error toast: *"This thread is locked to Wise AI. Please switch to a Wise AI model to use this thread."*

- **Scenario 2**: User creates a thread with LangGraph assistant
  - Thread is marked as `apiType: 'langgraph'`
  - If user switches to Wise AI model, this thread becomes **disabled**
  - Clicking the thread shows an error toast: *"This thread is locked to LangGraph. Please switch to a LangGraph assistant to use this thread."*

### 5. **Automatic Synchronization**
- **Wise AI threads**: Automatically saved to unified storage when messages are sent
- **LangGraph threads**: Automatically synced to unified storage after AI responses
- Both types appear together in the thread history sidebar

## Architecture

### File Structure

```
src/
├── lib/
│   ├── local-thread-storage.ts      # Unified storage utilities
│   └── migrate-threads.ts            # Migration from old format
├── components/
│   ├── thread/
│   │   ├── index.tsx                 # Main thread component with validation
│   │   └── history/
│   │       ├── index.tsx             # Thread history sidebar
│   │       └── UnifiedThreadList.tsx # Unified thread list with badges
│   └── ui/
│       └── badge.tsx                 # Badge component for API type labels
└── hooks/
    └── use-wise-ai-stream.tsx        # Wise AI stream hook with thread creation
```

### Key Functions

#### `createNewThread(apiType: ThreadApiType): LocalThread`
Creates a new thread with the specified API type.

```typescript
const newThread = createNewThread('wise-ai');
// or
const newThread = createNewThread('langgraph');
```

#### `syncLangGraphThread(threadId: string, messages: Message[]): void`
Syncs a LangGraph thread to the unified storage.

```typescript
syncLangGraphThread(threadId, messages);
```

#### `loadThreads(): LocalThread[]`
Loads all threads (both Wise AI and LangGraph) from unified storage.

```typescript
const allThreads = loadThreads();
```

## User Experience

### Thread List Display

```
┌─────────────────────────────────────────────┐
│  Thread History                             │
├─────────────────────────────────────────────┤
│  📝 How to implement auth?     🤖 Wise AI   │
│     10/15/2025 • 8 messages                 │
│     You can use JWT tokens...               │
├─────────────────────────────────────────────┤
│  📝 Create a graph workflow    ⚡ LangGraph │
│     10/14/2025 • 12 messages                │
│     Start by defining nodes...              │
├─────────────────────────────────────────────┤
│  📝 Debug API error           🤖 Wise AI    │
│     10/13/2025 • 5 messages                 │
│     Check your API key...                   │
└─────────────────────────────────────────────┘
```

### Locked Thread Display

When a thread is incompatible with the current API selection:

```
┌─────────────────────────────────────────────┐
│  📝 How to implement auth?     🤖 Wise AI   │
│     10/15/2025 • 8 messages                 │
│     You can use JWT tokens...               │
│     ⚠️ Switch to a Wise AI model to use     │
│        this thread                          │
└─────────────────────────────────────────────┘
```

## Migration

### Automatic Migration
The system automatically migrates old threads to the new unified format:

- Old `wise-ai-threads` → New `unified-threads` (with `apiType: 'wise-ai'`)
- Old `wise-ai-thread-messages` → New `unified-thread-messages`
- Migration runs once on app load
- Existing threads are preserved

### Manual Migration
If needed, you can manually trigger migration:

```typescript
import { migrateThreadsToUnified } from '@/lib/migrate-threads';

migrateThreadsToUnified();
```

## Implementation Details

### Thread Creation

**Wise AI:**
```typescript
// In use-wise-ai-stream.tsx
const newThread = createNewThread('wise-ai');
const threads = loadThreads();
threads.unshift(newThread);
saveThreads(threads);
```

**LangGraph:**
```typescript
// In thread/index.tsx
useEffect(() => {
  if (messages.length > 0 && messages[messages.length - 1].type === "ai") {
    if (!shouldUseWiseAI && threadId) {
      syncLangGraphThread(threadId, messages);
    }
  }
}, [messages, shouldUseWiseAI, threadId]);
```

### Thread Validation

```typescript
const setThreadId = (id: string | null) => {
  if (id !== null) {
    const threads = loadThreads();
    const thread = threads.find(t => t.id === id);
    
    if (thread) {
      const currentApiType = shouldUseWiseAI ? 'wise-ai' : 'langgraph';
      if (thread.apiType !== currentApiType) {
        toast.error(
          `This thread is locked to ${thread.apiType === 'wise-ai' ? 'Wise AI' : 'LangGraph'}.`
        );
        return; // Block thread switch
      }
    }
  }
  
  _setThreadId(id);
};
```

### Badge Component

```typescript
<Badge 
  variant={isWiseAI ? "default" : "secondary"}
  className={isWiseAI 
    ? 'bg-blue-500 text-white' 
    : 'bg-purple-500 text-white'
  }
>
  {isWiseAI ? (
    <>
      <Bot className="h-3 w-3" />
      <span>Wise AI</span>
    </>
  ) : (
    <>
      <Zap className="h-3 w-3" />
      <span>LangGraph</span>
    </>
  )}
</Badge>
```

## Benefits

### For Users
1. **Single View**: See all conversations in one place
2. **Clear Identification**: Know which API each thread uses at a glance
3. **Prevented Errors**: Can't accidentally use wrong API with a thread
4. **Better Organization**: All threads sorted by most recent activity

### For Developers
1. **Unified Storage**: Single source of truth for all threads
2. **Type Safety**: TypeScript ensures API type consistency
3. **Automatic Sync**: No manual thread management needed
4. **Easy Migration**: Existing threads automatically upgraded

## Testing Checklist

- [x] Create a thread with Wise AI model
- [x] Create a thread with LangGraph assistant
- [x] Both threads appear in the same list
- [x] Each thread shows correct badge (blue for Wise AI, purple for LangGraph)
- [x] Switch from Wise AI to LangGraph - Wise AI threads become disabled
- [x] Try clicking disabled thread - shows error toast
- [x] Switch back to Wise AI - thread becomes active again
- [x] Create new thread - gets correct API type
- [x] Messages persist across page reloads
- [x] Thread titles update based on first message

## Future Enhancements

1. **Thread Filtering**: Add filter to show only Wise AI or only LangGraph threads
2. **Thread Export**: Export threads with their API type metadata
3. **Thread Conversion**: Allow converting a thread from one API to another (with re-processing)
4. **Thread Search**: Search across all threads regardless of API type
5. **Thread Tags**: Add custom tags to organize threads further

## Troubleshooting

### Threads not appearing?
- Check browser console for localStorage errors
- Verify `unified-threads` key exists in localStorage
- Try running migration manually

### Thread locked unexpectedly?
- Check which model/assistant is currently selected
- Verify thread's `apiType` matches current selection
- Look for error toasts explaining the mismatch

### Migration not working?
- Clear old storage keys manually
- Refresh the page to re-run migration
- Check browser console for migration logs

## Summary

The unified thread system provides a seamless experience for managing conversations across both Wise AI and LangGraph APIs, with clear visual indicators, automatic synchronization, and robust validation to prevent API type mismatches. All threads are stored together, making it easy to see your entire conversation history at a glance while maintaining the integrity of each thread's API context.

