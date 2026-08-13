import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProductPage } from "@/components/ProductPage";
import { TeamDnaOverview } from "@/components/team-dna/TeamDnaOverview";
import { TeamDnaSelectionBridge } from "@/components/team-dna/TeamDnaSelectionBridge";

export default function TeamDnaPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <TeamDnaSelectionBridge />
        <ProductPage
          eyebrow="Team DNA"
          title="Understand the combined balance of an actual team."
          text="Team DNA combines the selected members to show collective strengths, balance, gaps and areas that may need attention."
        >
          <TeamDnaOverview />
        </ProductPage>
      </ProtectedRoute>
    </PageShell>
  );
}
