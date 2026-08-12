import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PeopleDirectory } from "@/components/people/PeopleDirectory";

export default function PeoplePage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <PeopleDirectory />
      </ProtectedRoute>
    </PageShell>
  );
}
