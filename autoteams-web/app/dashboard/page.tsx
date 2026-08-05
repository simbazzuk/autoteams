import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SmartDashboard } from "@/components/dashboard/SmartDashboard";

export default function DashboardPage() {
  return <PageShell><ProtectedRoute><section className="section dashboard-page"><div className="container"><SmartDashboard /></div></section></ProtectedRoute></PageShell>;
}
