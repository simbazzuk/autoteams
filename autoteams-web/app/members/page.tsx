import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MembersPanel } from "@/components/access/MembersPanel";

export default function MembersPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <MembersPanel />
      </ProtectedRoute>
    </PageShell>
  );
}
