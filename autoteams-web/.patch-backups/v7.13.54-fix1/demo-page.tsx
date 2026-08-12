import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DemoEnvironmentPanel } from "@/components/demo/DemoEnvironmentPanel";

export default function DemoPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <DemoEnvironmentPanel />
      </ProtectedRoute>
    </PageShell>
  );
}
