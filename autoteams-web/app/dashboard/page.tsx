import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CommercialDashboard } from "@/components/dashboard/CommercialDashboard";

export default function DashboardPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <CommercialDashboard />
      </ProtectedRoute>
    </PageShell>
  );
}
