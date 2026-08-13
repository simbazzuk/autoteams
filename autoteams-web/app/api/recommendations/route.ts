import { NextResponse } from "next/server";
import { cookies } from "next/headers";
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
import {
  ATLAS_AI_USAGE_COOKIE,
  evaluateAtlasAiAllowance,
} from "@/lib/ai/recommendation-usage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AiMode = "gemini" | "deterministic";

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

  const aiMode = getAiMode();
  const fallbackEnabled =
    process.env.GEMINI_FALLBACK_ENABLED !== "false";

  const model = getGeminiModel();
  const location =
    process.env.GOOGLE_CLOUD_LOCATION || "global";

  /*
   * DEVELOPMENT / LOW-COST MODE
   *
   * AUTOTEAMS_AI_MODE=fallback means:
   * - Do not create a Gemini client
   * - Do not call Vertex AI
   * - Do not consume Gemini tokens
   * - Generate the deterministic recommendation immediately
   */
  if (aiMode === "deterministic") {
    const startedAt = Date.now();

    const fallback =
      buildFallbackRecommendation(validatedRequest);

    const elapsed = Date.now() - startedAt;

    console.log(
      "AutoTeams recommendation completed in deterministic mode",
      {
        workspaceId: validatedRequest.workspaceId,
        candidateCount:
          validatedRequest.candidates.length,
        aiMode,
        responseTimeMs: elapsed,
      },
    );

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
        mode: "development",
        reason:
          "Gemini disabled by AUTOTEAMS_AI_MODE=fallback",
      },
    });
  }

  /*
   * LIVE GEMINI MODE
   */
  const startedAt = Date.now();

  try {
    // AUTOTEAMS_V71368_AI_ALLOWANCE
    // Launch-phase cost guardrail. Only live Gemini attempts consume allowance.
    const atlasCookieStore = await cookies();

    const atlasAiAllowance =
      evaluateAtlasAiAllowance(
        atlasCookieStore
          .get(ATLAS_AI_USAGE_COOKIE)
          ?.value,
      );

    if (!atlasAiAllowance.allowed) {
      const fallback =
        buildFallbackRecommendation(validatedRequest);

      console.log(
        "Atlas AI allowance prevented live Gemini call",
        {
          workspaceId: validatedRequest.workspaceId,
          reason: atlasAiAllowance.reason,
          used: atlasAiAllowance.used,
          limit: atlasAiAllowance.limit,
          remaining: atlasAiAllowance.remaining,
          period: atlasAiAllowance.period,
        },
      );

      return NextResponse.json({
        ...fallback,
        source: "fallback",
        model,
        telemetry: {
          provider: "google-vertex-ai",
          source: "fallback",
          model,
          location,
          responseTimeMs:
            Date.now() - startedAt,
          generatedAt:
            new Date().toISOString(),
          mode: "launch-allowance",
          reason:
            atlasAiAllowance.reason ===
            "monthly_limit"
              ? "Monthly Atlas AI recommendation allowance reached."
              : "Atlas AI recommendation cooldown is active.",
          aiAllowance: {
            used: atlasAiAllowance.used,
            limit: atlasAiAllowance.limit,
            remaining:
              atlasAiAllowance.remaining,
            period:
              atlasAiAllowance.period,
          },
        },
      });
    }

    if (atlasAiAllowance.cookieValue) {
      atlasCookieStore.set(
        ATLAS_AI_USAGE_COOKIE,
        atlasAiAllowance.cookieValue,
        {
          httpOnly: true,
          sameSite: "lax",
          secure:
            process.env.NODE_ENV ===
            "production",
          path: "/",
          maxAge: 60 * 60 * 24 * 31,
        },
      );
    }

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

    console.log(
      "Gemini recommendation completed",
      {
        workspaceId: validatedRequest.workspaceId,
        model,
        location,
        responseTimeMs: elapsed,
        usage,
      },
    );

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
        mode: "live",
      },
    });
  } catch (error) {
    const elapsed = Date.now() - startedAt;

    console.error(
      "Gemini recommendation failed",
      {
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
      },
    );

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
        mode: "automatic-fallback",
        reason:
          error instanceof Error
            ? error.message
            : "Gemini request failed.",
      },
    });
  }
}

function getAiMode(): AiMode {
  const configured =
    process.env.AUTOTEAMS_RECOMMENDATION_ENGINE
      ?.trim()
      .toLowerCase();

  if (configured === "deterministic") {
    return "deterministic";
  }

  return "gemini";
}

function readUsage(response: unknown): {
  promptTokens?: number;
  responseTokens?: number;
  totalTokens?: number;
} {
  if (
    !response ||
    typeof response !== "object"
  ) {
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
    promptTokens:
      usage.promptTokenCount,
    responseTokens:
      usage.candidatesTokenCount,
    totalTokens:
      usage.totalTokenCount,
  };
}
