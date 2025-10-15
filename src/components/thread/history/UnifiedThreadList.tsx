import { Button } from "@/components/ui/button";
import { useQueryState } from "nuqs";
import { LocalThread } from "@/lib/local-thread-storage";
import { Badge } from "@/components/ui/badge";
import { Bot, Zap } from "lucide-react";

function UnifiedThreadList({
  threads,
  onThreadClick,
  currentApiType,
}: {
  threads: LocalThread[];
  onThreadClick?: (threadId: string) => void;
  currentApiType?: 'wise-ai' | 'langgraph' | null;
}) {
  const [threadId, setThreadId] = useQueryState("threadId");

  return (
    <div className="flex h-full w-full flex-col items-start justify-start gap-2 overflow-y-scroll [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent">
      {threads.length === 0 ? (
        <div className="flex w-full items-center justify-center p-4 text-sm text-gray-500">
          No threads yet. Start a conversation!
        </div>
      ) : (
        threads.map((t) => {
          const isActive = t.id === threadId;
          const isCompatible = !currentApiType || t.apiType === currentApiType;
          const isWiseAI = t.apiType === 'wise-ai';
          
          return (
            <div key={t.id} className="w-full px-1">
              <Button
                variant="ghost"
                className={`w-full items-start justify-start text-left font-normal hover:bg-gray-100 ${
                  isActive ? 'bg-gray-100' : ''
                } ${!isCompatible ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (!isCompatible) {
                    // Show a toast or alert that this thread is locked to a different API
                    return;
                  }
                  onThreadClick?.(t.id);
                  setThreadId(t.id);
                }}
                disabled={!isCompatible}
              >
                <div className="flex flex-col items-start w-full gap-1">
                  <div className="flex items-center gap-2 w-full">
                    <p className="truncate text-ellipsis font-medium text-sm flex-1">
                      {t.title}
                    </p>
                    <Badge 
                      variant={isWiseAI ? "default" : "secondary"}
                      className={`text-xs px-1.5 py-0 h-5 flex items-center gap-1 ${
                        isWiseAI 
                          ? 'bg-black text-white hover:bg-white hover:text-black border border-black transition-colors' 
                          : 'bg-purple-500 hover:bg-purple-600 text-white'
                      }`}
                    >
                      {isWiseAI ? (
                        <>
                          {/*<Bot className="h-3 w-3" />*/}
                          <span>Wise AI</span>
                        </>
                      ) : (
                        <>
                          {/*<Zap className="h-3 w-3" />*/}
                          <span>LangGraph</span>
                        </>
                      )}
                    </Badge>
                  </div>
                  <p className="truncate text-ellipsis text-xs text-gray-500">
                    {new Date(t.updatedAt).toLocaleDateString()} • {t.messageCount} messages
                  </p>
                  {t.lastMessage && (
                    <p className="truncate text-ellipsis text-xs text-gray-400 w-full">
                      {t.lastMessage}
                    </p>
                  )}
                  {!isCompatible && (
                    <p className="text-xs text-red-500 italic">
                      Switch to {isWiseAI ? 'a Wise AI model' : 'a LangGraph assistant'} to use this thread
                    </p>
                  )}
                </div>
              </Button>
            </div>
          );
        })
      )}
    </div>
  );
}

export default UnifiedThreadList;

