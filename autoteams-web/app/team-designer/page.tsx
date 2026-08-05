import { PageHero, PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TeamDesigner } from "@/components/designer/TeamDesigner";

export default function TeamDesignerPage() {
  return <PageShell><ProtectedRoute><PageHero eyebrow="AI Team Designer" title="Design the whole team, not just a match." text="Define the purpose, size and priority. AutoTeams proposes a balanced group and explains every role." /><section className="section tight"><div className="container"><TeamDesigner /></div></section></ProtectedRoute></PageShell>;
}
