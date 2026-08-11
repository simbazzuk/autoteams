import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { UnifiedTeamCoach } from "@/components/team-coach/UnifiedTeamCoach";

export default function TeamCoachPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <UnifiedTeamCoach />
      </ProtectedRoute>
    </PageShell>
  );
}
