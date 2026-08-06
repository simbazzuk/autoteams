import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MyProfileDashboard } from "@/components/profile/MyProfileDashboard";

export default function ProfilePage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <MyProfileDashboard />
      </ProtectedRoute>
    </PageShell>
  );
}
