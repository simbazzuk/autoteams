import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TeamCanvas } from "@/components/canvas/TeamCanvas";

export default function TeamCanvasPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <section className="canvas-page">
          <TeamCanvas />
        </section>
      </ProtectedRoute>
    </PageShell>
  );
}
