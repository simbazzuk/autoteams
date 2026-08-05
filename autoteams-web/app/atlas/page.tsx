import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProductPage } from "@/components/ProductPage";
import { AtlasInterview } from "@/components/atlas/AtlasInterview";
import { AtlasOrb } from "@/components/AtlasOrb";

export default function AtlasPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <ProductPage
          eyebrow="Atlas"
          title="Your AI Team Strategist."
          text="Atlas learns how you collaborate, creates your Team DNA and helps you build balanced teams with every recommendation explained."
          actions={<AtlasOrb size="lg" />}
        >
          <AtlasInterview />
        </ProductPage>
      </ProtectedRoute>
    </PageShell>
  );
}
