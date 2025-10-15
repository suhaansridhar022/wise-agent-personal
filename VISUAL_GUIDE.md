# Visual Guide - Unified Thread System

## What You'll See 👀

### Thread List with Badges

When you open the thread history sidebar, you'll now see:

```
╔════════════════════════════════════════════════════════╗
║  Thread History                                        ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  ┌────────────────────────────────────────────────┐  ║
║  │  How to implement authentication?              │  ║
║  │  ┌──────────────┐                              │  ║
║  │  │ 🤖 Wise AI   │  ← Blue badge                │  ║
║  │  └──────────────┘                              │  ║
║  │  10/15/2025 • 8 messages                       │  ║
║  │  You can use JWT tokens for authentication...  │  ║
║  └────────────────────────────────────────────────┘  ║
║                                                        ║
║  ┌────────────────────────────────────────────────┐  ║
║  │  Create a graph workflow                       │  ║
║  │  ┌───────────────┐                             │  ║
║  │  │ ⚡ LangGraph  │  ← Purple badge             │  ║
║  │  └───────────────┘                             │  ║
║  │  10/14/2025 • 12 messages                      │  ║
║  │  Start by defining your nodes and edges...     │  ║
║  └────────────────────────────────────────────────┘  ║
║                                                        ║
║  ┌────────────────────────────────────────────────┐  ║
║  │  Debug API connection error                    │  ║
║  │  ┌──────────────┐                              │  ║
║  │  │ 🤖 Wise AI   │  ← Blue badge                │  ║
║  │  └──────────────┘                              │  ║
║  │  10/13/2025 • 5 messages                       │  ║
║  │  Check your API key configuration...           │  ║
║  └────────────────────────────────────────────────┘  ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

## Badge Colors 🎨

### Wise AI Badge
```
┌──────────────┐
│ 🤖 Wise AI   │  ← Blue background (#3B82F6)
└──────────────┘    White text
```

### LangGraph Badge
```
┌───────────────┐
│ ⚡ LangGraph  │  ← Purple background (#A855F7)
└───────────────┘    White text
```

## Thread States 🔒

### Active Thread (Compatible with Current API)
```
┌────────────────────────────────────────────────┐
│  How to implement authentication?              │
│  🤖 Wise AI                                     │
│  10/15/2025 • 8 messages                       │
│  You can use JWT tokens...                     │
│                                                 │
│  ✅ Clickable                                   │
│  ✅ Full opacity                                │
│  ✅ Hover effect                                │
└────────────────────────────────────────────────┘
```

### Locked Thread (Incompatible with Current API)
```
┌────────────────────────────────────────────────┐
│  Create a graph workflow                       │
│  ⚡ LangGraph                                   │
│  10/14/2025 • 12 messages                      │
│  Start by defining your nodes...               │
│  ⚠️ Switch to a LangGraph assistant to use     │
│     this thread                                │
│                                                 │
│  ❌ Disabled                                    │
│  🔒 50% opacity                                 │
│  🚫 No hover effect                             │
└────────────────────────────────────────────────┘
```

## User Interactions 🖱️

### Clicking a Compatible Thread
```
User clicks thread
       ↓
Thread loads ✅
       ↓
Messages display
       ↓
Can continue conversation
```

### Clicking a Locked Thread
```
User clicks locked thread
       ↓
Error toast appears 🔴
       ↓
┌─────────────────────────────────────────────┐
│ ⚠️ This thread is locked to LangGraph.      │
│    Please switch to a LangGraph assistant   │
│    to use this thread.                      │
└─────────────────────────────────────────────┘
       ↓
Thread doesn't switch
```

## Model/Graph Selection 🎛️

### Dropdown View
```
┌────────────────────────────────────┐
│  AI Provider                       │
├────────────────────────────────────┤
│  Models (Wise AI)                  │
│    • Wise_AI_gpt_4.1_nano         │
│    • Wise_AI_claude_3.5           │
│                                    │
│  Graphs (LangGraph)                │
│    • my-assistant-1                │
│    • workflow-graph-2              │
└────────────────────────────────────┘
```

### When Model Selected
```
Current: Wise_AI_gpt_4.1_nano ✅

Thread List:
  ✅ Thread A (Wise AI)     ← Active
  ❌ Thread B (LangGraph)   ← Locked
  ✅ Thread C (Wise AI)     ← Active
```

### When Graph Selected
```
Current: my-assistant-1 ✅

Thread List:
  ❌ Thread A (Wise AI)     ← Locked
  ✅ Thread B (LangGraph)   ← Active
  ❌ Thread C (Wise AI)     ← Locked
```

## Empty State 📭

When no threads exist:
```
┌────────────────────────────────────────────────┐
│  Thread History                                │
├────────────────────────────────────────────────┤
│                                                │
│                                                │
│           No threads yet.                      │
│      Start a conversation!                     │
│                                                │
│                                                │
└────────────────────────────────────────────────┘
```

## New Thread Button ➕

```
┌────────────────────────────────────┐
│  [📝 New Thread]                   │  ← Click to create
└────────────────────────────────────┘
       ↓
Creates thread with current API type
       ↓
If Wise AI selected → apiType: 'wise-ai'
If LangGraph selected → apiType: 'langgraph'
```

## Mobile View 📱

On mobile, threads appear in a slide-out sheet:
```
┌─────────────────────────────┐
│  ☰ Menu                     │
└─────────────────────────────┘
       ↓ (tap)
┌─────────────────────────────┐
│  Thread History         [×] │
├─────────────────────────────┤
│                             │
│  Thread 1  🤖 Wise AI       │
│  Thread 2  ⚡ LangGraph     │
│  Thread 3  🤖 Wise AI       │
│                             │
└─────────────────────────────┘
```

## Error Messages 🚨

### Thread Locked Error
```
┌─────────────────────────────────────────────────────┐
│  ⚠️ This thread is locked to Wise AI.               │
│     Please switch to a Wise AI model to use this    │
│     thread.                                         │
│                                          [Dismiss]  │
└─────────────────────────────────────────────────────┘
```

### Thread Locked Error (LangGraph)
```
┌─────────────────────────────────────────────────────┐
│  ⚠️ This thread is locked to LangGraph.             │
│     Please switch to a LangGraph assistant to use   │
│     this thread.                                    │
│                                          [Dismiss]  │
└─────────────────────────────────────────────────────┘
```

## Thread Metadata Display 📊

Each thread shows:
```
┌────────────────────────────────────────────────┐
│  [Thread Title]                                │  ← First message (50 chars)
│  [Badge: API Type]                             │  ← Wise AI or LangGraph
│  [Date] • [Message Count]                      │  ← 10/15/2025 • 8 messages
│  [Last Message Preview]                        │  ← Last 100 chars
└────────────────────────────────────────────────┘
```

## Hover Effects ✨

### Active Thread Hover
```
Normal State:
┌────────────────────────────┐
│  Thread Title              │
│  🤖 Wise AI                │
└────────────────────────────┘

Hover State:
┌────────────────────────────┐
│  Thread Title              │  ← Light gray background
│  🤖 Wise AI                │  ← Cursor: pointer
└────────────────────────────┘
```

### Locked Thread Hover
```
Normal State:
┌────────────────────────────┐
│  Thread Title              │  ← 50% opacity
│  ⚡ LangGraph              │
└────────────────────────────┘

Hover State:
┌────────────────────────────┐
│  Thread Title              │  ← No change
│  ⚡ LangGraph              │  ← Cursor: not-allowed
└────────────────────────────┘
```

## Loading States ⏳

### Loading Threads
```
┌────────────────────────────┐
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  ← Skeleton loader
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
└────────────────────────────┘
```

### Sending Message
```
┌────────────────────────────┐
│  Your message here         │
│                            │
│  ⏳ Sending...             │  ← Loading indicator
└────────────────────────────┘
```

## Real-World Example 🌍

### Scenario: User switches between APIs

**Step 1: Using Wise AI**
```
Current: Wise_AI_gpt_4.1_nano

Threads:
  ✅ "How to build auth?"     🤖 Wise AI
  ❌ "Create workflow"        ⚡ LangGraph
  ✅ "Debug API error"        🤖 Wise AI
```

**Step 2: User clicks "Create workflow" thread**
```
🔴 Error Toast:
"This thread is locked to LangGraph. Please switch to a 
LangGraph assistant to use this thread."
```

**Step 3: User switches to LangGraph assistant**
```
Current: my-assistant-1

Threads:
  ❌ "How to build auth?"     🤖 Wise AI
  ✅ "Create workflow"        ⚡ LangGraph  ← Now active!
  ❌ "Debug API error"        🤖 Wise AI
```

**Step 4: User clicks "Create workflow" thread**
```
✅ Thread loads successfully
✅ Messages display
✅ Can continue conversation
```

## Summary 📝

The unified thread system provides:

1. **Visual Clarity**: Badges show API type at a glance
2. **Safety**: Locked threads prevent API mismatches
3. **Organization**: All threads in one place
4. **Feedback**: Clear error messages guide users

All with a clean, modern UI that makes managing conversations across both APIs intuitive and error-free! 🎉

