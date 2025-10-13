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
      {threads.map((t) => (
        <div key={t.id} className="w-full px-1">
          <Button
            variant="ghost"
            className="w-[280px] items-start justify-start text-left font-normal"
            onClick={(e) => {
              e.preventDefault();
              onThreadClick?.(t.id);
              if (t.id === threadId) return;
              setThreadId(t.id);
            }}
          >
            <div className="flex flex-col items-start">
              <p className="truncate text-ellipsis font-medium">{t.title}</p>
              <p className="truncate text-ellipsis text-sm text-gray-500">
                {new Date(t.updatedAt).toLocaleDateString()}
              </p>
              {t.lastMessage && (
                <p className="truncate text-ellipsis text-xs text-gray-400">
                  {t.lastMessage}
                </p>
              )}
            </div>
          </Button>
        </div>
      ))}
    </div>
  );
}

export default WiseAIThreadList;
