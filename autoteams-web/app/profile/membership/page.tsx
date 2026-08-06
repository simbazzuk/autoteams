import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { WorkspaceMembershipDashboard } from "@/components/profile/WorkspaceMembershipDashboard";

export default function WorkspaceMembershipPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <WorkspaceMembershipDashboard />
      </ProtectedRoute>
    </PageShell>
  );
}
