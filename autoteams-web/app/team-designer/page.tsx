import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProductPage } from "@/components/ProductPage";
import { TeamDesigner } from "@/components/designer/TeamDesigner";

export default function TeamDesignerPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <ProductPage
          eyebrow="AI Team Designer"
          title="Design the whole team."
          text="Define the purpose, team size and design priority. AutoTeams proposes a balanced team and explains every role."
        >
          <TeamDesigner />
        </ProductPage>
      </ProtectedRoute>
    </PageShell>
  );
}
