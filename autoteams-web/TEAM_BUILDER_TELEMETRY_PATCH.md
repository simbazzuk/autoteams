# Phase 8 - Show Gemini telemetry in Team Builder

Phase 7 already returns `GeminiTeamRecommendation`.

After Phase 8 that object can include:

```ts
result.telemetry
```

Add this near the recommendation summary in
`components/team-builder/GuidedTeamBuilder.tsx`:

```tsx
{aiResult?.telemetry && (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 12,
    }}
  >
    <span>
      {aiResult.telemetry.source === "gemini"
        ? "✓ Live Gemini Recommendation"
        : "⚠ Deterministic Fallback"}
    </span>

    <span>
      Model: {aiResult.telemetry.model || "Unknown"}
    </span>

    <span>
      Response: {aiResult.telemetry.responseTimeMs} ms
    </span>

    {aiResult.telemetry.usage?.totalTokens && (
      <span>
        Tokens: {aiResult.telemetry.usage.totalTokens}
      </span>
    )}
  </div>
)}
```

Recommended wording:

```text
✓ Live Gemini Recommendation
Gemini 2.5 Flash
1,240 ms
824 tokens
```

Fallback wording:

```text
⚠ Gemini unavailable
Deterministic recommendation shown
```

Do not label fallback output as AI-generated.
