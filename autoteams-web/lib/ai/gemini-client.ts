import { GoogleGenAI } from "@google/genai";

type GeminiBackend =
  | "api"
  | "vertex";

let client:
  | GoogleGenAI
  | undefined;

let clientBackend:
  | GeminiBackend
  | undefined;

export function getGeminiBackend(): GeminiBackend {
  const configured =
    process.env
      .AUTOTEAMS_GEMINI_BACKEND
      ?.trim()
      .toLowerCase();

  if (configured === "api") {
    return "api";
  }

  if (configured === "vertex") {
    return "vertex";
  }

  /*
   * Backwards-compatible default.
   *
   * Existing GCP deployments continue to use Vertex AI unless the
   * backend is explicitly changed.
   */
  return "vertex";
}

export function getGeminiClient(): GoogleGenAI {
  const backend =
    getGeminiBackend();

  if (
    client &&
    clientBackend === backend
  ) {
    return client;
  }

  if (backend === "api") {
    const apiKey =
      process.env
        .GEMINI_API_KEY
        ?.trim();

    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is required when AUTOTEAMS_GEMINI_BACKEND=api.",
      );
    }

    client =
      new GoogleGenAI({
        apiKey,
      });

    clientBackend =
      backend;

    return client;
  }

  const project =
    process.env
      .GOOGLE_CLOUD_PROJECT
      ?.trim();

  const location =
    process.env
      .GOOGLE_CLOUD_LOCATION
      ?.trim() ||
    "global";

  if (!project) {
    throw new Error(
      "GOOGLE_CLOUD_PROJECT is required when AUTOTEAMS_GEMINI_BACKEND=vertex.",
    );
  }

  client =
    new GoogleGenAI({
      vertexai: true,
      project,
      location,
    });

  clientBackend =
    backend;

  return client;
}

export function getGeminiModel(): string {
  return (
    process.env
      .GEMINI_MODEL
      ?.trim() ||
    "gemini-2.5-flash"
  );
}