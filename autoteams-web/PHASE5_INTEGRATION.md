# Connect Phase 7 to GuidedTeamBuilder.tsx

Open:

```text
components/team-builder/GuidedTeamBuilder.tsx
```

## 1. Add imports

```ts
import { requestTeamRecommendation } from
  "@/lib/ai/recommendation-client";
import type { GeminiTeamRecommendation } from
  "@/lib/ai/recommendation-types";
```

## 2. Add state

Place alongside the existing Team Builder state:

```ts
const [aiResult, setAiResult] =
  useState<GeminiTeamRecommendation | null>(null);
const [isGenerating, setIsGenerating] = useState(false);
const [generationError, setGenerationError] = useState("");
```

## 3. Replace `generateRecommendation`

Replace the Phase 5 synchronous function with:

```ts
async function generateRecommendation(
  event: FormEvent<HTMLFormElement>,
) {
  event.preventDefault();
  setIsGenerating(true);
  setGenerationError("");

  try {
    const result = await requestTeamRecommendation({
      workspaceId: activeWorkspaceId,
      requirement,
      candidates: candidatePeople.map((person) => ({
        id: person.id,
        name: person.name,
        jobTitle: person.jobTitle,
        department: person.department,
        location: person.location,
        strengths: person.strengths,
        profileReady: person.teamDnaStatus === "ready",
      })),
    });

    const personById = new Map(
      candidatePeople.map((person) => [person.id, person]),
    );

    const ranked = result.rankedPeople
      .map((item) => {
        const person = personById.get(item.personId);

        return person
          ? {
              person,
              score: item.score,
              reasons: item.reasons,
              concerns: item.concerns,
            }
          : undefined;
      })
      .filter(
        (
          item,
        ): item is {
          person: WorkspacePerson;
          score: number;
          reasons: string[];
          concerns: string[];
        } => Boolean(item),
      );

    setAiResult(result);
    setRankedPeople(ranked);
    setFinalPeople(result.recommendedPersonIds);
    setStep("recommendation");
  } catch (error) {
    setGenerationError(
      error instanceof Error
        ? error.message
        : "Unable to generate recommendation.",
    );
  } finally {
    setIsGenerating(false);
  }
}
```

## 4. Update the Generate button

```tsx
<button
  className="button"
  disabled={isGenerating}
  type="submit"
>
  {isGenerating
    ? "Gemini is analysing…"
    : "Generate Recommendation →"}
</button>
```

Display errors near the button:

```tsx
{generationError && (
  <p role="alert">{generationError}</p>
)}
```

## 5. Use Gemini confidence

In the recommendation and confirmation views, prefer:

```ts
aiResult?.confidence ?? calculateConfidence(...)
```

## 6. Persist Gemini explanation with the team

Extend the Phase 5 `SavedTeam` type:

```ts
recommendation?: {
  source: "gemini" | "fallback";
  model?: string;
  summary: string;
  teamStrengths: string[];
  skillGaps: string[];
  risks: string[];
};
```

When saving:

```ts
recommendation: aiResult
  ? {
      source: aiResult.source,
      model: aiResult.model,
      summary: aiResult.summary,
      teamStrengths: aiResult.teamStrengths,
      skillGaps: aiResult.skillGaps,
      risks: aiResult.risks,
    }
  : undefined,
```

Phase 6 can then display the stored Gemini explanation rather than only
recalculating local insights.
