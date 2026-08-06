import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProductPage } from "@/components/ProductPage";
import { TeamDesigner } from "@/components/designer/TeamDesigner";

export default function TeamBuilderPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <ProductPage
          eyebrow="Build Teams with Atlas"
          title="Build from the right people, not the whole platform."
          text="Choose a private workspace, define the eligible Talent population and let Atlas recommend a balanced team from only those people."
        >
          <TeamDesigner />
        </ProductPage>
      </ProtectedRoute>
    </PageShell>
  );
}
