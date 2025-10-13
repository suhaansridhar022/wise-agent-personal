"use client";

import { Thread } from "@/components/thread";
import { StreamProvider } from "@/providers/Stream";
import { ThreadProvider } from "@/providers/Thread";
import { WiseAIThreadProvider } from "@/providers/WiseAIThreadProvider";
import { ArtifactProvider } from "@/components/thread/artifact";
import { Toaster } from "@/components/ui/sonner";
import { useUser } from "@/context/UserContext";
import { useSettings } from "@/context/SettingsContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import React from "react";

function ChatInterface() {
  const { apiType, selectedModel, modelProviderBaseUrl } = useSettings();
  
  // Check if we should use Wise AI
  const shouldUseWiseAI = selectedModel && (
    apiType === 'model' || 
    selectedModel.toLowerCase().includes('wise_ai') || 
    (modelProviderBaseUrl && modelProviderBaseUrl.includes('wisseninfotech.com'))
  );

  if (shouldUseWiseAI) {
    return (
      <WiseAIThreadProvider>
        <StreamProvider>
          <ArtifactProvider>
            <Thread />
          </ArtifactProvider>
        </StreamProvider>
      </WiseAIThreadProvider>
    );
  }

  return (
    <ThreadProvider>
      <StreamProvider>
        <ArtifactProvider>
          <Thread />
        </ArtifactProvider>
      </StreamProvider>
    </ThreadProvider>
  );
}

export default function DemoPage(): React.ReactNode {
  const { email } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If user is not logged in, redirect to login page
    if (!email) {
      router.push("/login");
    }
  }, [email, router]);

  // Show loading while checking authentication
  if (!email) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  // Only render the chat interface if user is authenticated
  return (
    <React.Suspense fallback={<div>Loading (layout)...</div>}>
      <Toaster />
      <ChatInterface />
    </React.Suspense>
  );
}
