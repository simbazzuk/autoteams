import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProductPage } from "@/components/ProductPage";
import { TeamGuideInterview } from "@/components/teamguide/TeamGuideInterview";

export default function TeamGuidePage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <ProductPage
          eyebrow="Conversational onboarding"
          title="Meet TeamGuide."
          text="A guided AI interview that turns natural conversation into an explainable collaboration profile."
        >
          <TeamGuideInterview />
        </ProductPage>
      </ProtectedRoute>
    </PageShell>
  );
}
