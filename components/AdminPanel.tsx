// components/AdminPanel.tsx - Admin panel for LLM configuration
import React, { useState, useEffect } from 'react';
import { getLLMConfig, saveLLMConfig, resetLLMConfig, validateLLMConfig, LLMConfig, LLMProvider } from '../config/llmConfig';
import Button from './Button';

interface AdminPanelProps {
  onClose?: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [config, setConfig] = useState<LLMConfig>(getLLMConfig());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setConfig(getLLMConfig());
  }, []);

  const handleProviderChange = (provider: LLMProvider) => {
    setConfig(prev => ({
      ...prev,
      provider,
      // Устанавливаем дефолтные модели для каждого провайдера
      modelId: provider === "openai" 
        ? "gpt-4o" 
        : "models/gemini-1.5-flash-latest",
    }));
  };

  const handleSave = () => {
    setError(null);
    setSuccess(false);

    const validation = validateLLMConfig(config);
    if (!validation.valid) {
      setError(validation.error || "Invalid configuration");
      return;
    }

    setSaving(true);
    try {
      saveLLMConfig(config);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onClose) onClose();
      }, 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm("Reset to default configuration? This will use Gemini with default settings.")) {
      const defaultConfig = resetLLMConfig();
      setConfig(defaultConfig);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  const modelSuggestions: Record<LLMProvider, string[]> = {
    openai: [
      "gpt-4o",
      "gpt-4o-2024-05-13",
      "gpt-4-turbo-2024-04-09",
      "gpt-4-1106-preview",
    ],
    google_gemini: [
      "models/gemini-2.5-pro",
      "models/gemini-2.5-flash-native-audio-preview-09-2025",
      "models/gemini-1.5-pro-latest",
      "models/gemini-1.5-flash-latest",
    ],
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-neutral-900 rounded-2xl border border-white/10 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">LLM Configuration</h2>
            {onClose && (
              <button
                onClick={onClose}
                className="text-neutral-400 hover:text-white transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-green-400">Configuration saved successfully!</p>
            </div>
          )}

          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold opacity-80">Provider</label>
            <div className="flex gap-3">
              <button
                onClick={() => handleProviderChange("openai")}
                className={`flex-1 p-3 rounded-lg border transition ${
                  config.provider === "openai"
                    ? "border-cyan-400 bg-cyan-400/10 text-cyan-400"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="font-semibold">OpenAI</div>
                <div className="text-xs opacity-70 mt-1">GPT-4, GPT-3.5</div>
              </button>
              <button
                onClick={() => handleProviderChange("google_gemini")}
                className={`flex-1 p-3 rounded-lg border transition ${
                  config.provider === "google_gemini"
                    ? "border-cyan-400 bg-cyan-400/10 text-cyan-400"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="font-semibold">Google Gemini</div>
                <div className="text-xs opacity-70 mt-1">Gemini 2.5, 1.5</div>
              </button>
            </div>
          </div>

          {/* Model ID */}
          <div className="space-y-2">
            <label htmlFor="modelId" className="text-sm font-semibold opacity-80">
              Model ID
            </label>
            <input
              id="modelId"
              type="text"
              value={config.modelId}
              onChange={(e) => setConfig(prev => ({ ...prev, modelId: e.target.value }))}
              placeholder={config.provider === "openai" ? "gpt-4o" : "models/gemini-1.5-flash-latest"}
              className="w-full rounded-xl bg-white/[0.05] border border-white/10 p-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-cyan-400/50"
            />
            <div className="text-xs text-neutral-400">
              Suggested models:
              <div className="mt-1 flex flex-wrap gap-2">
                {modelSuggestions[config.provider].map((model) => (
                  <button
                    key={model}
                    onClick={() => setConfig(prev => ({ ...prev, modelId: model }))}
                    className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-xs transition"
                  >
                    {model}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <label htmlFor="apiKey" className="text-sm font-semibold opacity-80">
              API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder="Enter your API key"
              className="w-full rounded-xl bg-white/[0.05] border border-white/10 p-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-cyan-400/50"
            />
            <p className="text-xs text-neutral-400">
              {config.provider === "openai"
                ? "Get your API key from https://platform.openai.com/api-keys"
                : "Get your API key from https://makersuite.google.com/app/apikey"}
            </p>
          </div>

          {/* Realtime Mode (optional) */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.realtimeMode ?? false}
                onChange={(e) => setConfig(prev => ({ ...prev, realtimeMode: e.target.checked }))}
                className="rounded border-white/20 bg-white/5"
              />
              <span className="text-sm font-semibold opacity-80">Realtime Mode</span>
            </label>
            <p className="text-xs text-neutral-400">
              Enable real-time audio/video streaming for live interviews (currently only supported for Gemini)
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
            >
              {saving ? "Saving..." : "Save Configuration"}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1"
            >
              Reset to Default
            </Button>
            {onClose && (
              <Button
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
            )}
          </div>

          {/* Current Configuration Info */}
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs text-neutral-400 mb-2">Current Configuration:</p>
            <div className="text-xs font-mono space-y-1">
              <div>Provider: <span className="text-cyan-400">{config.provider}</span></div>
              <div>Model: <span className="text-cyan-400">{config.modelId}</span></div>
              <div>API Key: <span className="text-cyan-400">{config.apiKey ? `${config.apiKey.substring(0, 8)}...` : "Not set"}</span></div>
              <div>Realtime: <span className="text-cyan-400">{config.realtimeMode ? "Enabled" : "Disabled"}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

