import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProductPage } from "@/components/ProductPage";
import { ProfileIntelligence } from "@/components/intelligence/ProfileIntelligence";

export default function InsightsPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <ProductPage
          eyebrow="Atlas Insights"
          title="Turn Team DNA into useful decisions."
          text="Review strengths, watch points, preferred roles and the team environment most likely to support success."
        >
          <ProfileIntelligence />
        </ProductPage>
      </ProtectedRoute>
    </PageShell>
  );
}
