import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProductPage } from "@/components/ProductPage";
import { TeamDnaDashboard } from "@/components/team-dna/TeamDnaDashboard";

export default function TeamDnaPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <ProductPage
          eyebrow="My Team DNA"
          title="Understand how you collaborate in each context."
          text="Review confidence, freshness, strengths and development themes, then compare how your Team DNA changes between work, friendship, community, sports and education."
        >
          <TeamDnaDashboard />
        </ProductPage>
      </ProtectedRoute>
    </PageShell>
  );
}
