import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProductPage } from "@/components/ProductPage";
import { ContextualAtlasInterview } from "@/components/atlas/ContextualAtlasInterview";

export default function AtlasPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <ProductPage
          eyebrow="Atlas Contextual Interview"
          title="Complete the core interview once, then add each context."
          text="Atlas reuses your core collaboration answers and asks only the business, friendship, community, sports or education questions needed for the selected profile."
        >
          <ContextualAtlasInterview />
        </ProductPage>
      </ProtectedRoute>
    </PageShell>
  );
}
