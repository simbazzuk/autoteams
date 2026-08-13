import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MyAtlasProfileDashboard } from "@/components/atlas-profile/MyAtlasProfileDashboard";

export default function MyAtlasProfilePage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <MyAtlasProfileDashboard />
      </ProtectedRoute>
    </PageShell>
  );
}