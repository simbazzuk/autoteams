import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProductPage } from "@/components/ProductPage";
import { ProfileIntelligence } from "@/components/intelligence/ProfileIntelligence";

export default function IntelligencePage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <ProductPage
          eyebrow="AutoTeams Intelligence"
          title="Turn conversation into Team DNA."
          text="Gemini helps convert natural language into structured signals while the final team logic remains explainable."
        >
          <ProfileIntelligence />
        </ProductPage>
      </ProtectedRoute>
    </PageShell>
  );
}
