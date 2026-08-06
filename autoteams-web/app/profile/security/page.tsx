import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProfileSecurityDashboard } from "@/components/profile/ProfileSecurityDashboard";

export default function ProfileSecurityPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <ProfileSecurityDashboard />
      </ProtectedRoute>
    </PageShell>
  );
}
