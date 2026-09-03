import { Suspense } from "react";
import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TeamScienceMessaging } from "@/components/messaging/TeamScienceMessaging";

export default function MessagesPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <Suspense fallback={null}>
          <TeamScienceMessaging />
        </Suspense>
      </ProtectedRoute>
    </PageShell>
  );
}