import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProfilePrivacyDashboard } from "@/components/profile/ProfilePrivacyDashboard";

export default function ProfilePrivacyPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <ProfilePrivacyDashboard />
      </ProtectedRoute>
    </PageShell>
  );
}
