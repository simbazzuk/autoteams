import {
  PageShell,
} from "@/components/Site";
import {
  FirebaseAuthCard,
} from "@/components/firebase-auth/FirebaseAuthCard";

export default function FirebaseAuthTestPage() {
  return (
    <PageShell>
      <section
        style={{
          minHeight: "70vh",
          padding: "48px 0 80px",
          background: "#0f1420",
        }}
      >
        <div className="container">
          <span className="eyebrow">
            AutoTeams v4.0 Phase 2
          </span>

          <h1
            style={{
              margin: "10px 0 20px",
              color: "#f5f7fb",
              fontSize: 44,
            }}
          >
            Firebase Authentication Test
          </h1>

          <div
            style={{
              maxWidth: 620,
            }}
          >
            <FirebaseAuthCard />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
