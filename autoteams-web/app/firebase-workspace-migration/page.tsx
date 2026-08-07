import {
  PageShell,
} from "@/components/Site";
import {
  WorkspaceMigrationCard,
} from "@/components/firebase-workspace/WorkspaceMigrationCard";

export default function FirebaseWorkspaceMigrationPage() {
  return (
    <PageShell>
      <section
        style={{
          minHeight: "75vh",
          padding: "48px 0 80px",
          background: "#0f1420",
        }}
      >
        <div className="container">
          <span className="eyebrow">
            AutoTeams v4.0 Phase 3
          </span>

          <h1
            style={{
              maxWidth: 900,
              margin: "10px 0 12px",
              color: "#f5f7fb",
              fontSize: 48,
              letterSpacing: "-.04em",
            }}
          >
            Firestore Workspace Migration
          </h1>

          <p
            style={{
              maxWidth: 780,
              margin: "0 0 22px",
              color: "#8f9bb0",
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            Copy existing AutoTeams groups into Firestore
            without deleting the local version. This makes
            workspace ownership and membership cloud-ready.
          </p>

          <WorkspaceMigrationCard />
        </div>
      </section>
    </PageShell>
  );
}
