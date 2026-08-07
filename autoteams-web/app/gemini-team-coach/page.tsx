import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { GeminiTeamCoach } from "@/components/gemini-team-coach/GeminiTeamCoach";

export default function GeminiTeamCoachPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <GeminiTeamCoach />
      </ProtectedRoute>
    </PageShell>
  );
}
