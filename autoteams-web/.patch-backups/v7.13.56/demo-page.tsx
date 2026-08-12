import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DemoEnvironmentPanel } from "@/components/demo/DemoEnvironmentPanel";
import { UnifiedDemoScenarios } from "@/components/demo/UnifiedDemoScenarios";
export default function DemoPage() {
  return (
    <PageShell>
      <ProtectedRoute>
<UnifiedDemoScenarios />
        <DemoEnvironmentPanel />
</ProtectedRoute>
    </PageShell>
  );
}
