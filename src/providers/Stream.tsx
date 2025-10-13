import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { useStream } from "@langchain/langgraph-sdk/react";
import { type Message } from "@langchain/langgraph-sdk";
import {
  uiMessageReducer,
  isUIMessage,
  isRemoveUIMessage,
  type UIMessage,
  type RemoveUIMessage,
} from "@langchain/langgraph-sdk/react-ui";
import { useQueryState } from "nuqs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LangGraphLogoSVG } from "@/components/icons/langgraph";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";
import { getApiKey } from "@/lib/api-key";
import { useThreads } from "./Thread";
import { toast } from "sonner";
import { useSettings } from "@/context/SettingsContext";
import { isWiseAIModel, isWiseAIUrl } from "@/lib/wise-ai-api";
import { useWiseAIStream } from "@/hooks/use-wise-ai-stream";
import { useWiseAIThreads } from "@/hooks/use-wise-ai-threads";

export type StateType = { messages: Message[]; ui?: UIMessage[] };

const useTypedStream = useStream<
  StateType,
  {
    UpdateType: {
      messages?: Message[] | Message | string;
      ui?: (UIMessage | RemoveUIMessage)[] | UIMessage | RemoveUIMessage;
      context?: Record<string, unknown>;
    };
    CustomEventType: UIMessage | RemoveUIMessage;
  }
>;

type StreamContextType = ReturnType<typeof useTypedStream>;
const StreamContext = createContext<StreamContextType | undefined>(undefined);

async function sleep(ms = 4000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkGraphStatus(
  apiUrl: string,
  apiKey: string | null,
): Promise<{ ok: boolean; status?: number; statusText?: string; bodyText?: string }> {
  try {
    const res = await fetch(`${apiUrl}/info`, {
      ...(apiKey && {
        headers: {
          "X-Api-Key": apiKey,
        },
      }),
    });
    const bodyText = await res.text().catch(() => undefined);
    return { ok: res.ok, status: res.status, statusText: res.statusText, bodyText };
  } catch (e) {
    console.error(e);
    return { ok: false };
  }
}

const StreamSession = ({
  children,
  apiKey,
  apiUrl,
  assistantId,
}: {
  children: ReactNode;
  apiKey: string | null;
  apiUrl: string;
  assistantId: string;
}) => {
  const [threadId, setThreadId] = useQueryState("threadId");
  const { getThreads, setThreads } = useThreads();
  const streamValue = useTypedStream({
    apiUrl,
    apiKey: apiKey ?? undefined,
    assistantId,
    threadId: threadId ?? null,
    fetchStateHistory: true,
    onCustomEvent: (event, options) => {
      if (isUIMessage(event) || isRemoveUIMessage(event)) {
        options.mutate((prev) => {
          const ui = uiMessageReducer(prev.ui ?? [], event);
          return { ...prev, ui };
        });
      }
    },
    onThreadId: (id) => {
      setThreadId(id);
      // Refetch threads list when thread ID changes.
      // Wait for some seconds before fetching so we're able to get the new thread that was created.
      sleep().then(() => getThreads().then(setThreads).catch(console.error));
    },
  });

  useEffect(() => {
    checkGraphStatus(apiUrl, apiKey).then((result) => {
      if (!result.ok) {
        toast.error("Failed to connect to LangGraph server", {
          description: () => (
            <div className="space-y-1">
              <p>
                URL: <code>{apiUrl}</code>
              </p>
              {typeof result.status !== "undefined" && (
                <p>
                  Status: <code>{result.status} {result.statusText}</code>
                </p>
              )}
              {result.bodyText && (
                <p className="max-w-[520px] truncate">
                  Message: <code>{result.bodyText}</code>
                </p>
              )}
              <p>Check your Deployment URL, Assistant/Graph ID, and API Key.</p>
            </div>
          ),
          duration: 12000,
          richColors: true,
          closeButton: true,
        });
      }
    });
  }, [apiKey, apiUrl]);

  return (
    <StreamContext.Provider value={streamValue}>
      {children}
    </StreamContext.Provider>
  );
};

// Default values for the form
const DEFAULT_API_URL = "http://localhost:2024";
const DEFAULT_ASSISTANT_ID = "agent";

export const StreamProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const {
    langGraphUrl: settingsApiUrl,
    langGraphAssistantId: settingsAssistantId,
    langGraphApiKey: settingsApiKey,
    apiType,
    selectedModel,
    modelProviderBaseUrl,
    modelProviderApiKey,
  } = useSettings();
  
  // Always call the hooks at the top level (Rules of Hooks)
  const [threadId, setThreadId] = useQueryState("threadId");
  const wiseAIStream = useWiseAIStream(selectedModel, modelProviderBaseUrl, modelProviderApiKey, threadId);
  
  // Get environment variables
  const envApiUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL;
  const envAssistantId: string | undefined =
    process.env.NEXT_PUBLIC_ASSISTANT_ID;

  // Use URL params with env var fallbacks, but provide defaults if none exist
  const [apiUrl, setApiUrl] = useQueryState("apiUrl", {
    defaultValue: envApiUrl || DEFAULT_API_URL,
  });
  const [assistantId, setAssistantId] = useQueryState("assistantId", {
    defaultValue: envAssistantId || DEFAULT_ASSISTANT_ID,
  });

  // For API key, use localStorage with env var fallback
  const [apiKey, _setApiKey] = useState(() => {
    const storedKey = getApiKey();
    return storedKey || "";
  });

  const setApiKey = (key: string) => {
    window.localStorage.setItem("lg:chat:apiKey", key);
    _setApiKey(key);
  };

  // Determine final values to use, prioritizing URL params then env vars, then defaults
  const finalApiUrl = apiUrl || envApiUrl || DEFAULT_API_URL;
  const finalAssistantId = assistantId || envAssistantId || DEFAULT_ASSISTANT_ID;
  const effectiveApiUrl = (settingsApiUrl?.trim() || finalApiUrl)?.trim();
  const effectiveAssistantId = (settingsAssistantId?.trim() || finalAssistantId)?.trim();
  const effectiveApiKey = (settingsApiKey?.trim() || apiKey || undefined) ?? undefined;

  // Check if we should use Wise AI instead of LangGraph
  const shouldUseWiseAI = selectedModel && (
    apiType === 'model' || 
    isWiseAIModel(selectedModel) || 
    isWiseAIUrl(modelProviderBaseUrl)
  );

  // Debug logging
  console.log('StreamProvider Debug:', {
    selectedModel,
    apiType,
    modelProviderBaseUrl,
    modelProviderApiKey: modelProviderApiKey ? '***' : 'missing',
    shouldUseWiseAI
  });

  // If using Wise AI, use the Wise AI stream hook
  if (shouldUseWiseAI && selectedModel && modelProviderBaseUrl && modelProviderApiKey) {
    return (
      <StreamContext.Provider value={wiseAIStream}>
        {children}
      </StreamContext.Provider>
    );
  }

  // If Wise AI is selected but configuration is missing, show error
  if (shouldUseWiseAI && (!selectedModel || !modelProviderBaseUrl || !modelProviderApiKey)) {
    const errorStream = {
      messages: [],
      isLoading: false,
      error: new Error('Wise AI configuration incomplete. Please check your settings.'),
      submit: () => {},
      stop: () => {},
      getMessagesMetadata: () => ({ firstSeenState: { values: { messages: [] }, parent_checkpoint: null } }),
      values: { messages: [], ui: [] },
      interrupt: null,
      ui: []
    } as StreamContextType;

    return (
      <StreamContext.Provider value={errorStream}>
        {children}
      </StreamContext.Provider>
    );
  }

  // Skip the setup form and go directly to the chat interface
  // Default values are now provided above

  return (
    <StreamSession
      apiKey={(effectiveApiKey as string | undefined) ?? null}
      apiUrl={effectiveApiUrl}
      assistantId={effectiveAssistantId}
    >
      {children}
    </StreamSession>
  );
};

// Create a custom hook to use the context
export const useStreamContext = (): StreamContextType => {
  const context = useContext(StreamContext);
  if (context === undefined) {
    throw new Error("useStreamContext must be used within a StreamProvider");
  }
  return context;
};

export default StreamContext;
