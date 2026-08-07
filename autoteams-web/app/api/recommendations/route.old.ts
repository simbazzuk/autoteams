import { NextResponse } from "next/server";
import {
  getGeminiClient,
  getGeminiModel,
} from "@/lib/ai/gemini-client";
import { recommendationResponseSchema } from "@/lib/ai/recommendation-schema";
import { buildRecommendationPrompt } from "@/lib/ai/recommendation-prompt";
import {
  validateGeminiRecommendation,
  validateRecommendationRequest,
} from "@/lib/ai/recommendation-validation";
import { buildFallbackRecommendation } from "@/lib/ai/fallback-recommendation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let validatedRequest;

  try {
    validatedRequest = validateRecommendationRequest(
      await request.json(),
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invalid recommendation request.",
      },
      { status: 400 },
    );
  }

  const fallbackEnabled =
    process.env.GEMINI_FALLBACK_ENABLED !== "false";

  const model = getGeminiModel();
  const location =
    process.env.GOOGLE_CLOUD_LOCATION || "global";
  const startedAt = Date.now();

  try {
    const client = getGeminiClient();

    const response = await client.models.generateContent({
      model,
      contents: buildRecommendationPrompt({
        requirement: validatedRequest.requirement,
        candidates: validatedRequest.candidates,
      }),
      config: {
        systemInstruction:
          "Produce an evidence-based, fair, human-reviewable team recommendation. Never infer protected or sensitive characteristics.",
        responseMimeType: "application/json",
        responseJsonSchema: recommendationResponseSchema,
        temperature: 0.2,
      },
    });

    if (!response.text) {
      throw new Error(
        "Gemini returned an empty response.",
      );
    }

    const result = validateGeminiRecommendation({
      value: JSON.parse(response.text),
      request: validatedRequest,
    });

    const elapsed = Date.now() - startedAt;
    const usage = readUsage(response);

    console.log("Gemini recommendation completed", {
      workspaceId: validatedRequest.workspaceId,
      model,
      location,
      responseTimeMs: elapsed,
      usage,
    });

    return NextResponse.json({
      ...result,
      source: "gemini",
      model,
      telemetry: {
        provider: "google-vertex-ai",
        source: "gemini",
        model,
        location,
        responseTimeMs: elapsed,
        usage,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    const elapsed = Date.now() - startedAt;

    console.error("Gemini recommendation failed", {
      message:
        error instanceof Error
          ? error.message
          : "Unknown Gemini error",
      workspaceId: validatedRequest.workspaceId,
      candidateCount:
        validatedRequest.candidates.length,
      model,
      location,
      responseTimeMs: elapsed,
    });

    if (!fallbackEnabled) {
      return NextResponse.json(
        {
          error:
            "Gemini is unavailable and deterministic fallback is disabled.",
        },
        { status: 503 },
      );
    }

    const fallback =
      buildFallbackRecommendation(validatedRequest);

    return NextResponse.json({
      ...fallback,
      source: "fallback",
      model,
      telemetry: {
        provider: "google-vertex-ai",
        source: "fallback",
        model,
        location,
        responseTimeMs: elapsed,
        generatedAt: new Date().toISOString(),
      },
    });
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
