import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TeamBuilderExperience } from "@/components/team-builder/TeamBuilderExperience";

export default function TeamBuilderPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <TeamBuilderExperience />
      </ProtectedRoute>
    </PageShell>
  );
}