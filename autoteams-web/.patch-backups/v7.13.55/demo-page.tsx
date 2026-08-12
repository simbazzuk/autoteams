import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DemoEnvironmentPanel } from "@/components/demo/DemoEnvironmentPanel";
import { EducationDemoScenario } from "@/components/demo/EducationDemoScenario";

export default function DemoPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <DemoEnvironmentPanel />
      <EducationDemoScenario />
</ProtectedRoute>
    </PageShell>
  );
}
