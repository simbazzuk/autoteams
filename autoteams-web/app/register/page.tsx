import { PageHero, PageShell } from "@/components/Site";
import { PersonaWizard } from "@/components/PersonaWizard";

export default function RegisterPage() {
  return <PageShell><PageHero eyebrow="Dynamic onboarding" title="One account. Multiple Team Personas." text="Choose a team type and AutoTeams asks only the questions relevant to that experience." /><section className="section tight"><div className="container"><PersonaWizard /></div></section></PageShell>;
}
