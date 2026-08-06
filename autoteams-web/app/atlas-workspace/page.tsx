import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AtlasWorkspace } from "@/components/atlas-workspace/AtlasWorkspace";

export default function AtlasWorkspacePage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <AtlasWorkspace />
      </ProtectedRoute>
    </PageShell>
  );
}
