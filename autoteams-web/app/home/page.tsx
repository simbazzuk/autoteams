import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AiFirstHome } from "@/components/home/AiFirstHome";

export default function HomePage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <AiFirstHome />
      </ProtectedRoute>
    </PageShell>
  );
}
