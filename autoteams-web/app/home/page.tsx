import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { HomeExperience } from "@/components/home/HomeExperience";

export default function HomePage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <HomeExperience />
      </ProtectedRoute>
    </PageShell>
  );
}
