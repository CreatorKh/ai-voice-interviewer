// Utility function to normalize model IDs for different providers
export function normalizeModelId(modelId: string, provider: "openai" | "google_gemini"): string {
  if (provider === "google_gemini") {
    // Remove 'models/' prefix if present (SDK adds it automatically)
    let normalized = modelId.startsWith("models/") ? modelId.slice(7) : modelId;
    // Remove '-latest' suffix if present (not a valid model name)
    if (normalized.endsWith("-latest")) {
      normalized = normalized.slice(0, -7);
    }
    return normalized;
  }
  return modelId;
}

