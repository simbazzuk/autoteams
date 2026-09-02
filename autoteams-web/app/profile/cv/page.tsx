import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CvIntelligencePanel } from "@/components/profile/CvIntelligencePanel";

export default function ProfileCvPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <CvIntelligencePanel />
      </ProtectedRoute>
    </PageShell>
  );
}
