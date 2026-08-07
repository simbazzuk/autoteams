import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { GeminiLiveStatus } from "@/components/gemini-status/GeminiLiveStatus";

export default function GeminiStatusPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <GeminiLiveStatus />
      </ProtectedRoute>
    </PageShell>
  );
}
