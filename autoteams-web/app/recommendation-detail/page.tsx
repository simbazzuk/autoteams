import {
  PageShell,
} from "@/components/Site";
import {
  RecommendationDetailRoute,
} from "@/components/recommendation-detail/RecommendationDetailRoute";

export default function RecommendationDetailPage() {
  return (
    <PageShell>
      <section
        style={{
          minHeight: "75vh",
          padding: "44px 0 80px",
          background: "#0f1420",
        }}
      >
        <div className="container">
          <span className="eyebrow">
            AutoTeams
          </span>

          <div
            style={{
              marginTop: 15,
            }}
          >
            <RecommendationDetailRoute />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
