import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TalentPanel } from "@/components/workspaces/PeoplePanel";

export default function TalentPage() {
  return <PageShell><ProtectedRoute><TalentPanel /></ProtectedRoute></PageShell>;
}
