import { PageShell } from "@/components/Site";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProductPage } from "@/components/ProductPage";
import { NotificationCentre } from "@/components/notifications/NotificationCentre";

export default function NotificationsPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <ProductPage
          eyebrow="Notification Centre"
          title="Stay on top of what matters."
          text="Review new matches, AI insights, profile updates and important product messages."
        >
          <NotificationCentre />
        </ProductPage>
      </ProtectedRoute>
    </PageShell>
  );
}
