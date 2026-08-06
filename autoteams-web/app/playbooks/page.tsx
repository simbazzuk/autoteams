import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PlaybooksPage } from "@/components/playbooks/PlaybooksPage";

export default function PlaybooksRoute() {
  return (
    <PageShell>
      <ProtectedRoute>
        <PlaybooksPage />
      </ProtectedRoute>
    </PageShell>
  );
}
