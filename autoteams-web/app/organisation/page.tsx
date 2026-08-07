import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MyGroupDashboard } from "@/components/organisation/MyGroupDashboard";

export default function OrganisationPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <MyGroupDashboard />
      </ProtectedRoute>
    </PageShell>
  );
}
