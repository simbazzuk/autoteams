import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { V10Dashboard } from "@/components/dashboard/V10Dashboard";

export default function DashboardPage() {
  return <PageShell><ProtectedRoute><V10Dashboard /></ProtectedRoute></PageShell>;
}
