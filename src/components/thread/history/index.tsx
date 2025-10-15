import { Button } from "@/components/ui/button";
import { useThreads } from "@/providers/Thread";
import { Thread } from "@langchain/langgraph-sdk";
import { useEffect } from "react";

import { getContentString } from "../utils";
import { useQueryState, parseAsBoolean } from "nuqs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { PanelRightOpen, PanelRightClose, Settings as SettingsIcon, LogOut } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useUser } from "@/context/UserContext";
import { Separator } from "@/components/ui/separator";
import { Settings } from "@/components/settings/Settings";
import { useState } from "react";
import { useSettings } from "@/context/SettingsContext";
import UnifiedThreadList from "./UnifiedThreadList";
import { LocalThread, ThreadApiType } from "@/lib/local-thread-storage";
import { loadThreads } from "@/lib/local-thread-storage";

function UserSection() {
  const { email, signOut } = useUser();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  if (!email) return null;

  return (
    <>
      <div className="w-full border-t border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white text-sm font-medium">
              {email.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900 truncate max-w-[180px]">
                {email}
              </span>
              <span className="text-xs text-gray-500">Online</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100"
              onClick={() => setIsSettingsOpen(true)}
            >
              <SettingsIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <Settings 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
}

function ThreadList({
  threads,
  onThreadClick,
}: {
  threads: Thread[];
  onThreadClick?: (threadId: string) => void;
}) {
  const [threadId, setThreadId] = useQueryState("threadId");

  return (
    <div className="flex h-full w-full flex-col items-start justify-start gap-2 overflow-y-scroll [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent">
      {threads.map((t) => {
        let itemText = t.thread_id;
        if (
          typeof t.values === "object" &&
          t.values &&
          "messages" in t.values &&
          Array.isArray(t.values.messages) &&
          t.values.messages?.length > 0
        ) {
          const firstMessage = t.values.messages[0];
          itemText = getContentString(firstMessage.content);
        }
        return (
          <div
            key={t.thread_id}
            className="w-full px-1"
          >
            <Button
              variant="ghost"
              className="w-[280px] items-start justify-start text-left font-normal"
              onClick={(e) => {
                e.preventDefault();
                onThreadClick?.(t.thread_id);
                if (t.thread_id === threadId) return;
                setThreadId(t.thread_id);
              }}
            >
              <p className="truncate text-ellipsis">{itemText}</p>
            </Button>
          </div>
        );
      })}
    </div>
  );
}

function ThreadHistoryLoading() {
  return (
    <div className="flex h-full w-full flex-col items-start justify-start gap-2 overflow-y-scroll [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent">
      {Array.from({ length: 30 }).map((_, i) => (
        <Skeleton
          key={`skeleton-${i}`}
          className="h-10 w-[280px]"
        />
      ))}
    </div>
  );
}

export default function ThreadHistory() {
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const [chatHistoryOpen, setChatHistoryOpen] = useQueryState(
    "chatHistoryOpen",
    parseAsBoolean.withDefault(false),
  );

  // Check if we're using Wise AI
  const { apiType, selectedModel, modelProviderBaseUrl } = useSettings();
  const shouldUseWiseAI = selectedModel && (
    apiType === 'model' || 
    selectedModel.toLowerCase().includes('wise_ai') || 
    (modelProviderBaseUrl && modelProviderBaseUrl.includes('wisseninfotech.com'))
  );

  // Try to get threads context, but don't fail if it doesn't exist
  let threadContext;
  try {
    threadContext = useThreads();
  } catch (error) {
    // Context not available, that's okay for Wise AI mode
    threadContext = null;
  }

  // State for unified threads
  const [allThreads, setAllThreads] = useState<LocalThread[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  
  // Determine current API type
  const currentApiType: ThreadApiType | null = shouldUseWiseAI ? 'wise-ai' : 'langgraph';

  // Load all threads (both Wise AI and LangGraph from localStorage)
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Always load from localStorage (unified storage)
    const threads = loadThreads();
    setAllThreads(threads);
  }, [chatHistoryOpen]);

  // Reload threads periodically to catch updates
  useEffect(() => {
    const interval = setInterval(() => {
      const threads = loadThreads();
      setAllThreads(threads);
    }, 1000); // Reload every second
    
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="shadow-inner-right hidden h-screen w-[300px] shrink-0 flex-col border-r-[1px] border-slate-300 lg:flex">
        <div className="flex w-full flex-1 flex-col overflow-hidden">
          <div className="flex w-full items-center justify-between px-4 pt-1.5 pb-4 shrink-0">
            <Button
              className="hover:bg-gray-100"
              variant="ghost"
              onClick={() => setChatHistoryOpen((p) => !p)}
            >
              {chatHistoryOpen ? (
                <PanelRightOpen className="size-5" />
              ) : (
                <PanelRightClose className="size-5" />
              )}
            </Button>
            <h1 className="text-xl font-semibold tracking-tight">
              Thread History
            </h1>
          </div>
          <div className="flex-1 w-full overflow-hidden">
            {threadsLoading ? (
              <ThreadHistoryLoading />
            ) : (
              <UnifiedThreadList 
                threads={allThreads} 
                currentApiType={currentApiType}
              />
            )}
          </div>
        </div>
        <div className="shrink-0">
          <UserSection />
        </div>
      </div>
      <div className="lg:hidden">
        <Sheet
          open={!!chatHistoryOpen && !isLargeScreen}
          onOpenChange={(open) => {
            if (isLargeScreen) return;
            setChatHistoryOpen(open);
          }}
        >
          <SheetContent
            side="left"
            className="flex lg:hidden flex-col justify-between"
          >
            <div className="flex flex-col flex-1">
              <SheetHeader>
                <SheetTitle>Thread History</SheetTitle>
              </SheetHeader>
              <div className="flex-1 mt-4">
                <UnifiedThreadList 
                  threads={allThreads}
                  currentApiType={currentApiType}
                  onThreadClick={() => setChatHistoryOpen((o) => !o)}
                />
              </div>
            </div>
            <UserSection />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
