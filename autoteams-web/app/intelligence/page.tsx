import { PageHero, PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProfileIntelligence } from "@/components/intelligence/ProfileIntelligence";

export default function IntelligencePage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <PageHero
          eyebrow="AutoTeams Intelligence"
          title="Turn conversation into Team DNA."
          text="Gemini helps extract useful, structured team signals from a natural conversation while the matching engine remains explainable."
        />
        <section className="section tight">
          <div className="container">
            <ProfileIntelligence />
          </div>
        </section>
      </ProtectedRoute>
    </PageShell>
  );
}
