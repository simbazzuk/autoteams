import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProductPage } from "@/components/ProductPage";
import { MatchExplorer } from "@/components/intelligence/MatchExplorer";

export default function MatchesPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <ProductPage
          eyebrow="Atlas Recommendation Studio"
          title="Design teams with evidence, balance and explanation."
          text="Compare candidates, understand every matching signal and see how each person changes the overall Team DNA before creating the team."
        >
          <MatchExplorer />
        </ProductPage>
      </ProtectedRoute>
    </PageShell>
  );
}
