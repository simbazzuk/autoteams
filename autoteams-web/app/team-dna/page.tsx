import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TeamDnaOverview } from "@/components/team-dna/TeamDnaOverview";

export default function TeamDnaPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <TeamDnaOverview />
      </ProtectedRoute>
    </PageShell>
  );
}