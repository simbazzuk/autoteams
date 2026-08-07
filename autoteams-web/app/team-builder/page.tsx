import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { GuidedTeamBuilder } from "@/components/team-builder/GuidedTeamBuilder";

export default function TeamBuilderPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <GuidedTeamBuilder />
      </ProtectedRoute>
    </PageShell>
  );
}
