import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { GuidedOnboarding } from "@/components/onboarding/GuidedOnboarding";

export default function GettingStartedPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <GuidedOnboarding />
      </ProtectedRoute>
    </PageShell>
  );
}
