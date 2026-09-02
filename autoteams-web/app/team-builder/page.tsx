import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { GuidedTeamBuilder } from "@/components/team-builder/GuidedTeamBuilder";
import { UnifiedTeamBuilderEntry } from "@/components/team-builder/UnifiedTeamBuilderEntry";

export default function TeamBuilderPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <UnifiedTeamBuilderEntry />
        <div id="autoteams-guided-team-builder">
          <GuidedTeamBuilder />
        </div>
      </ProtectedRoute>
    </PageShell>
  );
}
