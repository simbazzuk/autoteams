import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RecommendationCentre } from "@/components/recommendations/RecommendationCentre";

export default function RecommendationsPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <RecommendationCentre />
      </ProtectedRoute>
    </PageShell>
  );
}
