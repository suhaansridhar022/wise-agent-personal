"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type SettingsContextType = {
  chatName: string;
  setChatName: (name: string) => void;
  chatLogoDataUrl: string | null;
  setChatLogoDataUrl: (dataUrl: string | null) => void;
  // LangGraph settings
  langGraphUrl: string;
  setLangGraphUrl: (url: string) => void;
  langGraphAssistantId: string;
  setLangGraphAssistantId: (id: string) => void;
  langGraphApiKey: string;
  setLangGraphApiKey: (key: string) => void;
  // Model provider settings
  modelProviderBaseUrl: string;
  setModelProviderBaseUrl: (url: string) => void;
  modelProviderApiKey: string;
  setModelProviderApiKey: (key: string) => void;
  models: string[];
  setModels: (models: string[]) => void;
  selectedModel: string | null;
  setSelectedModel: (model: string | null) => void;
  // API Type selection
  apiType: 'model' | 'graph' | null;
  setApiType: (type: 'model' | 'graph' | null) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const CHAT_NAME_STORAGE_KEY = "chat:name";
const LG_URL_STORAGE_KEY = "settings:lg:url";
const LG_ASSISTANT_ID_STORAGE_KEY = "settings:lg:assistantId";
const LG_API_KEY_STORAGE_KEY = "settings:lg:apiKey";
const MP_BASE_URL_STORAGE_KEY = "settings:mp:baseUrl";
const MP_API_KEY_STORAGE_KEY = "settings:mp:apiKey";
const MODELS_STORAGE_KEY = "settings:mp:models";
const SELECTED_MODEL_STORAGE_KEY = "settings:mp:selectedModel";
const API_TYPE_STORAGE_KEY = "settings:api:type";

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [chatName, setChatNameState] = useState<string>("Agent Chat");
  const [chatLogoDataUrl, setChatLogoDataUrl] = useState<string | null>(null);
  const [langGraphUrl, setLangGraphUrlState] = useState<string>("");
  const [langGraphAssistantId, setLangGraphAssistantIdState] = useState<string>("");
  const [langGraphApiKey, setLangGraphApiKeyState] = useState<string>("");
  const [modelProviderBaseUrl, setModelProviderBaseUrlState] = useState<string>("");
  const [modelProviderApiKey, setModelProviderApiKeyState] = useState<string>("");
  const [models, setModelsState] = useState<string[]>([]);
  const [selectedModel, setSelectedModelState] = useState<string | null>(null);
  const [apiType, setApiTypeState] = useState<'model' | 'graph' | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CHAT_NAME_STORAGE_KEY);
      if (stored && typeof stored === "string") {
        setChatNameState(stored);
      }
      const lgUrl = window.localStorage.getItem(LG_URL_STORAGE_KEY) ?? "";
      const lgAssistantId = window.localStorage.getItem(LG_ASSISTANT_ID_STORAGE_KEY) ?? "";
      const lgApiKey = window.localStorage.getItem(LG_API_KEY_STORAGE_KEY) ?? "";
      const mpBaseUrl = window.localStorage.getItem(MP_BASE_URL_STORAGE_KEY) ?? "";
      const mpApiKey = window.localStorage.getItem(MP_API_KEY_STORAGE_KEY) ?? "";
      const modelsStr = window.localStorage.getItem(MODELS_STORAGE_KEY);
      const savedSelectedModel = window.localStorage.getItem(SELECTED_MODEL_STORAGE_KEY);
      const savedApiType = window.localStorage.getItem(API_TYPE_STORAGE_KEY) as 'model' | 'graph' | null;
      setLangGraphUrlState(lgUrl);
      setLangGraphAssistantIdState(lgAssistantId);
      setLangGraphApiKeyState(lgApiKey);
      setModelProviderBaseUrlState(mpBaseUrl);
      setModelProviderApiKeyState(mpApiKey);
      if (modelsStr) {
        try {
          const arr = JSON.parse(modelsStr);
          if (Array.isArray(arr)) setModelsState(arr.filter((m) => typeof m === "string"));
        } catch {
          // ignore
        }
      }
      setSelectedModelState(savedSelectedModel || null);
      setApiTypeState(savedApiType || null);
    } catch {
      // ignore
    }
  }, []);

  const setChatName = (name: string) => {
    setChatNameState(name);
    try {
      window.localStorage.setItem(CHAT_NAME_STORAGE_KEY, name);
    } catch {
      // ignore
    }
  };

  const value = useMemo<SettingsContextType>(
    () => ({
      chatName,
      setChatName,
      chatLogoDataUrl,
      setChatLogoDataUrl,
      langGraphUrl,
      setLangGraphUrl: (url: string) => {
        setLangGraphUrlState(url);
        try { window.localStorage.setItem(LG_URL_STORAGE_KEY, url); } catch {}
      },
      langGraphAssistantId,
      setLangGraphAssistantId: (id: string) => {
        setLangGraphAssistantIdState(id);
        try { window.localStorage.setItem(LG_ASSISTANT_ID_STORAGE_KEY, id); } catch {}
      },
      langGraphApiKey,
      setLangGraphApiKey: (key: string) => {
        setLangGraphApiKeyState(key);
        try { window.localStorage.setItem(LG_API_KEY_STORAGE_KEY, key); } catch {}
      },
      modelProviderBaseUrl,
      setModelProviderBaseUrl: (url: string) => {
        setModelProviderBaseUrlState(url);
        try { window.localStorage.setItem(MP_BASE_URL_STORAGE_KEY, url); } catch {}
      },
      modelProviderApiKey,
      setModelProviderApiKey: (key: string) => {
        setModelProviderApiKeyState(key);
        try { window.localStorage.setItem(MP_API_KEY_STORAGE_KEY, key); } catch {}
      },
      models,
      setModels: (ms: string[]) => {
        setModelsState(ms);
        try { window.localStorage.setItem(MODELS_STORAGE_KEY, JSON.stringify(ms)); } catch {}
      },
      selectedModel,
      setSelectedModel: (m: string | null) => {
        setSelectedModelState(m);
        try {
          if (m === null) window.localStorage.removeItem(SELECTED_MODEL_STORAGE_KEY);
          else window.localStorage.setItem(SELECTED_MODEL_STORAGE_KEY, m);
        } catch {}
      },
      apiType,
      setApiType: (type: 'model' | 'graph' | null) => {
        setApiTypeState(type);
        try {
          if (type === null) window.localStorage.removeItem(API_TYPE_STORAGE_KEY);
          else window.localStorage.setItem(API_TYPE_STORAGE_KEY, type);
        } catch {}
      },
    }),
    [
      chatName,
      chatLogoDataUrl,
      langGraphUrl,
      langGraphAssistantId,
      langGraphApiKey,
      modelProviderBaseUrl,
      modelProviderApiKey,
      models,
      selectedModel,
      apiType,
    ],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}


