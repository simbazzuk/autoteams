import { NextResponse } from "next/server";
import {
  getGeminiClient,
  getGeminiModel,
} from "@/lib/ai/gemini-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  const location =
    process.env.GOOGLE_CLOUD_LOCATION || "global";
  const model = getGeminiModel();

  if (!project) {
    return NextResponse.json(
      {
        connected: false,
        provider: "google-vertex-ai",
        model,
        location,
        error:
          "GOOGLE_CLOUD_PROJECT is not configured.",
      },
      { status: 503 },
    );
  }

  const startedAt = Date.now();

  try {
    const client = getGeminiClient();

    const response = await client.models.generateContent({
      model,
      contents:
        "Reply with exactly the word CONNECTED.",
      config: {
        temperature: 0,
        maxOutputTokens: 8,
      },
    });

    const elapsed = Date.now() - startedAt;
    const text = response.text?.trim() || "";
    const usage = readUsage(response);

    return NextResponse.json({
      connected: true,
      provider: "google-vertex-ai",
      project,
      location,
      model,
      responseTimeMs: elapsed,
      response: text,
      usage,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        connected: false,
        provider: "google-vertex-ai",
        project,
        location,
        model,
        responseTimeMs: Date.now() - startedAt,
        error:
          error instanceof Error
            ? error.message
            : "Unknown Gemini connection error.",
        checkedAt: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}

function readUsage(response: unknown): {
  promptTokens?: number;
  responseTokens?: number;
  totalTokens?: number;
} {
  if (!response || typeof response !== "object") {
    return {};
  }

  const usage = (
    response as {
      usageMetadata?: {
        promptTokenCount?: number;
        candidatesTokenCount?: number;
        totalTokenCount?: number;
      };
    }
  ).usageMetadata;

  if (!usage) return {};

  return {
    promptTokens: usage.promptTokenCount,
    responseTokens: usage.candidatesTokenCount,
    totalTokens: usage.totalTokenCount,
  };
}
