import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProductPage } from "@/components/ProductPage";
import { MatchExplorer } from "@/components/intelligence/MatchExplorer";

export default function MatchesPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <ProductPage
          eyebrow="Explainable matching"
          title="Discover people who fit the purpose."
          text="Compare goal alignment, availability, shared interests, location, Team DNA and trust in one transparent score."
        >
          <MatchExplorer />
        </ProductPage>
      </ProtectedRoute>
    </PageShell>
  );
}
