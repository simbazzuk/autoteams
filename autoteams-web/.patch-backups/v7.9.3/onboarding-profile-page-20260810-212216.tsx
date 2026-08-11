import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RegistrationProfilePanel } from "@/components/onboarding/RegistrationProfilePanel";

export default function RegistrationProfilePage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <RegistrationProfilePanel />
      </ProtectedRoute>
    </PageShell>
  );
}
