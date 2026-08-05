import { PageHero, PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MatchExplorer } from "@/components/intelligence/MatchExplorer";

export default function MatchesPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <PageHero
          eyebrow="Explainable matching"
          title="Build and understand a recommended team."
          text="AutoTeams combines goal alignment, availability, interests, location, Team DNA balance and trust into a transparent score."
        />
        <section className="section tight">
          <div className="container">
            <MatchExplorer />
          </div>
        </section>
      </ProtectedRoute>
    </PageShell>
  );
}
