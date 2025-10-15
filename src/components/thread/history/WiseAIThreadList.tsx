import { Button } from "@/components/ui/button";
import { useQueryState } from "nuqs";
import { LocalThread } from "@/lib/local-thread-storage";

function WiseAIThreadList({
  threads,
  onThreadClick,
}: {
  threads: LocalThread[];
  onThreadClick?: (threadId: string) => void;
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
          return (
            <div key={t.id} className="w-full px-1">
              <Button
                variant="ghost"
                className={`w-full items-start justify-start text-left font-normal hover:bg-gray-100 ${
                  isActive ? 'bg-gray-100' : ''
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  onThreadClick?.(t.id);
                  setThreadId(t.id);
                }}
              >
                <div className="flex flex-col items-start w-full gap-1">
                  <p className="truncate text-ellipsis font-medium text-sm w-full">
                    {t.title}
                  </p>
                  <p className="truncate text-ellipsis text-xs text-gray-500">
                    {new Date(t.updatedAt).toLocaleDateString()} • {t.messageCount} messages
                  </p>
                  {t.lastMessage && (
                    <p className="truncate text-ellipsis text-xs text-gray-400 w-full">
                      {t.lastMessage}
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

export default WiseAIThreadList;
