import {
  PageShell,
} from "@/components/Site";
import {
  RecommendationCompare,
} from "@/components/recommendation-compare/RecommendationCompare";

export default function RecommendationComparePage() {
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
            TeamScience.ai
          </span>

          <h1
            style={{
              margin: "10px 0 12px",
              color: "#f5f7fb",
              fontSize: 48,
              letterSpacing: "-.04em",
            }}
          >
            Recommendation Compare
          </h1>

          <p
            style={{
              maxWidth: 780,
              margin: "0 0 22px",
              color: "#8f9bb0",
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            Compare two recommendation outcomes side by
            side and understand how membership, confidence,
            risk and team health changed.
          </p>

          <RecommendationCompare />
        </div>
      </section>
    </PageShell>
  );
}
