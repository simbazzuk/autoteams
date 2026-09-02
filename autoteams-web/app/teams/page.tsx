import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MyTeamsHub } from "@/components/teams/MyTeamsHub";

export default function TeamsPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <MyTeamsHub />
      </ProtectedRoute>
    </PageShell>
  );
}
