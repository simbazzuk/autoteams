import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProfileContextSelection } from "@/components/onboarding/ProfileContextSelection";

export default function OnboardingProfilePage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <ProfileContextSelection />
      </ProtectedRoute>
    </PageShell>
  );
}
