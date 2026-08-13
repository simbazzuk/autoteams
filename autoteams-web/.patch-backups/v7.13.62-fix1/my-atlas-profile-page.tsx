import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProductPage } from "@/components/ProductPage";
import { MyAtlasProfileDashboard } from "@/components/atlas-profile/MyAtlasProfileDashboard";

export default function MyAtlasProfilePage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <ProductPage
          eyebrow="My Atlas Profile"
          title="Understand how you prefer to collaborate."
          text="Your Atlas Profile is your individual, contextual collaboration profile. Atlas uses it as one input when explaining team recommendations."
        >
          <MyAtlasProfileDashboard />
        </ProductPage>
      </ProtectedRoute>
    </PageShell>
  );
}
