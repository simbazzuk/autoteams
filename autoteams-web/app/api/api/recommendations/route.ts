import { NextResponse } from "next/server";
import { getGeminiClient, getGeminiModel } from "@/lib/ai/gemini-client";
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

  try {
    const client = getGeminiClient();
    const model = getGeminiModel();

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
      throw new Error("Gemini returned an empty response.");
    }

    const result = validateGeminiRecommendation({
      value: JSON.parse(response.text),
      request: validatedRequest,
    });

    return NextResponse.json({
      ...result,
      model,
    });
  } catch (error) {
    console.error("Gemini recommendation failed", {
      message:
        error instanceof Error
          ? error.message
          : "Unknown Gemini error",
      workspaceId: validatedRequest.workspaceId,
      candidateCount: validatedRequest.candidates.length,
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

    return NextResponse.json(
      buildFallbackRecommendation(validatedRequest),
    );
  }
}
