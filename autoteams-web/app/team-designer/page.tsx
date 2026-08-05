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
          title="Design the whole team around the outcome."
          text="Define the purpose, size and priority. AutoTeams proposes a balanced composition and explains every role."
        >
          <TeamDesigner />
        </ProductPage>
      </ProtectedRoute>
    </PageShell>
  );
}
