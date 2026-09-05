import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { FeedbackIdeas } from "@/components/feedback/FeedbackIdeas";

export default function FeedbackPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <FeedbackIdeas />
      </ProtectedRoute>
    </PageShell>
  );
}
