import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DemoEnvironmentPanel } from "@/components/demo/DemoEnvironmentPanel";
import { UnifiedDemoScenarios } from "@/components/demo/UnifiedDemoScenarios";
import { HackathonDemoScenario } from "@/components/demo/HackathonDemoScenario";
export default function DemoPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <UnifiedDemoScenarios />
        <HackathonDemoScenario />
      </ProtectedRoute>
    </PageShell>
  );
}
