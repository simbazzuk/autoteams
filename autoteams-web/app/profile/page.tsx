import { Suspense } from "react";
import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SimpleProfileDashboard } from "@/components/profile/SimpleProfileDashboard";

export default function ProfilePage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <Suspense fallback={null}>
          <SimpleProfileDashboard />
        </Suspense>
      </ProtectedRoute>
    </PageShell>
  );
}
