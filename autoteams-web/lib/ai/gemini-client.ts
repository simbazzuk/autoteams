import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | undefined;

export function getGeminiClient(): GoogleGenAI {
  if (client) return client;

  const project = process.env.GOOGLE_CLOUD_PROJECT;
  const location =
    process.env.GOOGLE_CLOUD_LOCATION || "global";

  if (!project) {
    throw new Error(
      "GOOGLE_CLOUD_PROJECT is required for Vertex AI Gemini.",
    );
  }

  client = new GoogleGenAI({
    vertexai: true,
    project,
    location,
  });

  return client;
}

export function getGeminiModel(): string {
  return process.env.GEMINI_MODEL || "gemini-2.5-flash";
}
