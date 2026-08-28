import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProductPage } from "@/components/ProductPage";
import { SettingsPanel } from "@/components/settings/SettingsPanel";

export default function SettingsPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <ProductPage
          eyebrow="Workspace settings"
          title="Make TeamScience.ai yours."
          text="Manage your account experience, appearance and product notifications."
        >
          <SettingsPanel />
        </ProductPage>
      </ProtectedRoute>
    </PageShell>
  );
}
