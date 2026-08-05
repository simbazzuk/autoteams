import { PageHero, PageShell } from "@/components/Site";
import { PersonaDashboard } from "@/components/PersonaDashboard";

export default function DashboardPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="AutoTeams Dashboard"
        title="Your Team Personas."
        text="View, manage and create the profiles AutoTeams will use for different team experiences."
      />
      <section className="section tight">
        <div className="container">
          <PersonaDashboard />
        </div>
      </section>
    </PageShell>
  );
}
