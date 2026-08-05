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
          title="Turn conversation into useful team insight."
          text="Gemini converts natural language into structured signals while the final matching and team decisions remain explainable."
        >
          <ProfileIntelligence />
        </ProductPage>
      </ProtectedRoute>
    </PageShell>
  );
}
