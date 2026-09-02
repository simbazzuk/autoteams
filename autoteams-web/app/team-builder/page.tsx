import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { GuidedTeamBuilder } from "@/components/team-builder/GuidedTeamBuilder";
import { UnifiedTeamBuilderEntry } from "@/components/team-builder/UnifiedTeamBuilderEntry";
import { AtlasRecruitGaps } from "@/components/team-builder/AtlasRecruitGaps";

export default function TeamBuilderPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <UnifiedTeamBuilderEntry />
        <div id="autoteams-guided-team-builder">
          <GuidedTeamBuilder />
        </div>
        <AtlasRecruitGaps />
      </ProtectedRoute>
    </PageShell>
  );
}
