import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TeamBuilderBackToOptions } from "@/components/team-builder/TeamBuilderBackToOptions";
import { TeamBuilderExperience } from "@/components/team-builder/TeamBuilderExperience";

export default function TeamBuilderPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <TeamBuilderBackToOptions />
        <TeamBuilderExperience />
      </ProtectedRoute>
    </PageShell>
  );
}
