import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProductPage } from "@/components/ProductPage";
import { ProfileIntelligence } from "@/components/intelligence/ProfileIntelligence";

export default function TeamDnaPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <ProductPage
          eyebrow="Team DNA"
          title="Understand how someone contributes."
          text="Turn natural language into an explainable profile covering collaboration, communication, leadership, planning, creativity and reliability."
        >
          <ProfileIntelligence />
        </ProductPage>
      </ProtectedRoute>
    </PageShell>
  );
}
