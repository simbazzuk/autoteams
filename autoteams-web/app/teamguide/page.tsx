import { PageHero, PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TeamGuideInterview } from "@/components/teamguide/TeamGuideInterview";

export default function TeamGuidePage() {
  return <PageShell><ProtectedRoute><PageHero eyebrow="Conversational onboarding" title="Meet TeamGuide." text="A guided AI interview that turns natural conversation into an explainable Team DNA profile." /><section className="section tight"><div className="container"><TeamGuideInterview /></div></section></ProtectedRoute></PageShell>;
}
