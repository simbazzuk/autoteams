import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LearningCentre } from "@/components/learning/LearningCentre";

export default function LearningCentrePage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <LearningCentre />
      </ProtectedRoute>
    </PageShell>
  );
}
