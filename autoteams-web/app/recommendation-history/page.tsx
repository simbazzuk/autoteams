import {
  PageShell,
} from "@/components/Site";
import {
  RecommendationHistory,
} from "@/components/recommendation-history/RecommendationHistory";

export default function RecommendationHistoryPage() {
  return (
    <PageShell>
      <section
        style={{
          minHeight: "75vh",
          padding: "48px 0 80px",
          background: "#0f1420",
        }}
      >
        <div className="container">
          <span className="eyebrow">
            AutoTeams
          </span>

          <h1
            style={{
              maxWidth: 900,
              margin: "10px 0 12px",
              color: "#f5f7fb",
              fontSize: 48,
              letterSpacing: "-.04em",
            }}
          >
            Recommendation History
          </h1>

          <p
            style={{
              maxWidth: 800,
              margin: "0 0 22px",
              color: "#8f9bb0",
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            Review the AI and deterministic recommendations
            generated for the active workspace, together
            with their decision evidence and telemetry.
          </p>

          <RecommendationHistory />
        </div>
      </section>
    </PageShell>
  );
}
