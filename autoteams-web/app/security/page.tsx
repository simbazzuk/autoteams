import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SecurityPanel } from "@/components/security/SecurityPanel";

export default function SecurityPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <SecurityPanel />
      </ProtectedRoute>
    </PageShell>
  );
}
