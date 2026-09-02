import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TeamInvitationCentre } from "@/components/teams/TeamInvitationCentre";

export default function TeamInvitationsPage() {
  return (
    <ProtectedRoute>
      <TeamInvitationCentre />
    </ProtectedRoute>
  );
}
