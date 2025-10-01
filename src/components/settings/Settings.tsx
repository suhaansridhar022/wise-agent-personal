"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { X, Upload, User, Palette, Settings as SettingsIcon, DatabaseZap } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useSettings } from "@/context/SettingsContext";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Settings({ isOpen, onClose }: SettingsProps) {
  const { email } = useUser();
  const {
    chatName,
    setChatName,
    chatLogoDataUrl,
    setChatLogoDataUrl,
    langGraphUrl,
    setLangGraphUrl,
    langGraphAssistantId,
    setLangGraphAssistantId,
    langGraphApiKey,
    setLangGraphApiKey,
    modelProviderBaseUrl,
    setModelProviderBaseUrl,
    modelProviderApiKey,
    setModelProviderApiKey,
    models,
    setModels,
  } = useSettings();
  const [activeSection, setActiveSection] = useState("general");
  const [newModel, setNewModel] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  if (!isOpen) return null;

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === "string" ? reader.result : null;
        setChatLogoDataUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-6">
            <SettingsIcon className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Settings</h2>
          </div>
          
          <nav className="space-y-2">
            <Button
              variant={activeSection === "general" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveSection("general")}
            >
              <SettingsIcon className="h-4 w-4 mr-2" />
              General
            </Button>
            <Button
              variant={activeSection === "langgraph" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveSection("langgraph")}
            >
              <DatabaseZap className="h-4 w-4 mr-2" />
              LangGraph
            </Button>
            <Button
              variant={activeSection === "model" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveSection("model")}
            >
              <Palette className="h-4 w-4 mr-2" />
              Model Provider
            </Button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold capitalize">{activeSection} Settings</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeSection === "general" && (
              <div className="space-y-6">
                {/* Chat Name */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Chat Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="chatName">Chat Name</Label>
                      <Input
                        id="chatName"
                        value={chatName}
                        onChange={(e) => setChatName(e.target.value)}
                        placeholder="Enter chat name"
                      />
                    </div>

                    {/* Logo Upload */}
                    <div className="space-y-2">
                      <Label htmlFor="logo">Chat Logo</Label>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
                          {chatLogoDataUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={chatLogoDataUrl} alt="Chat logo" className="w-full h-full object-cover" />
                          ) : (
                            <Upload className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <Input
                            id="logo"
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            onClick={() => document.getElementById('logo')?.click()}
                            className="w-full"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Logo
                          </Button>
                          <p className="text-sm text-gray-500 mt-1">
                            Recommended: 64x64px, PNG or SVG
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* User Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">User Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="userId">User ID</Label>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <Input
                          id="userId"
                          value={email || "Not logged in"}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        User ID cannot be changed
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Theme Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Appearance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="theme">Dark Mode</Label>
                        <p className="text-sm text-gray-500">
                          Switch between light and dark themes
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4 text-gray-400" />
                        <Switch
                          id="theme"
                          checked={isDarkMode}
                          onCheckedChange={setIsDarkMode}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            {activeSection === "langgraph" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">LangGraph Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="lgUrl">Deployment URL</Label>
                      <Input
                        id="lgUrl"
                        value={langGraphUrl}
                        onChange={(e) => setLangGraphUrl(e.target.value)}
                        placeholder="http://localhost:2024"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lgAssistant">Assistant / Graph ID</Label>
                      <Input
                        id="lgAssistant"
                        value={langGraphAssistantId}
                        onChange={(e) => setLangGraphAssistantId(e.target.value)}
                        placeholder="agent"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lgKey">LangGraph API Key</Label>
                      <Input
                        id="lgKey"
                        type="password"
                        value={langGraphApiKey}
                        onChange={(e) => setLangGraphApiKey(e.target.value)}
                        placeholder="lsv2_pt_..."
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            {activeSection === "model" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Model Provider</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="mpBaseUrl">Base URL</Label>
                      <Input
                        id="mpBaseUrl"
                        value={modelProviderBaseUrl}
                        onChange={(e) => setModelProviderBaseUrl(e.target.value)}
                        placeholder="https://api.openai.com/v1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mpApiKey">API Key</Label>
                      <Input
                        id="mpApiKey"
                        type="password"
                        value={modelProviderApiKey}
                        onChange={(e) => setModelProviderApiKey(e.target.value)}
                        placeholder="sk-..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Models</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={newModel}
                          onChange={(e) => setNewModel(e.target.value)}
                          placeholder="e.g., gpt-4o, gpt-4o-mini"
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            const trimmed = newModel.trim();
                            if (!trimmed) return;
                            const updated = Array.from(new Set([...(models || []), trimmed]));
                            setModels(updated);
                            setNewModel("");
                          }}
                        >
                          Add
                        </Button>
                      </div>
                      {models?.length ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {models.map((m) => (
                            <div key={m} className="flex items-center gap-2 rounded border px-2 py-1 text-sm">
                              <span>{m}</span>
                              <button
                                type="button"
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => setModels(models.filter((x) => x !== m))}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={onClose}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
