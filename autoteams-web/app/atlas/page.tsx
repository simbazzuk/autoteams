import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProductPage } from "@/components/ProductPage";
import { ContextualAtlasInterview } from "@/components/atlas/ContextualAtlasInterview";

export default function AtlasPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <ProductPage
          eyebrow="Atlas Interview"
          title="Build and maintain your individual Atlas Profiles."
          text="Complete the reusable collaboration interview once, then answer only the Business, Friendship, Community, Sports or Education questions relevant to each contextual profile."
        >
          <ContextualAtlasInterview />
        </ProductPage>
      </ProtectedRoute>
    </PageShell>
  );
}
