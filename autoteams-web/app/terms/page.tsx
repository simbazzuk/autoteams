import { PageShell } from "@/components/Site";

export default function TermsPage() {
  return (
    <PageShell>
      <main className="v115-legal-page">
        <div className="container">
          <span className="eyebrow">Draft terms</span>
          <h1>TeamScience.ai Terms of Use</h1>
          <p>
            This test release provides decision-support recommendations. Atlas
            does not replace human judgement, professional assessment or an
            organisation's legal and employment responsibilities.
          </p>
          <section>
            <h2>Appropriate use</h2>
            <p>
              Users must not use TeamScience.ai to discriminate, infer protected
              characteristics or make automated decisions with significant
              effects without appropriate review.
            </p>
          </section>
          <section>
            <h2>Accounts and workspaces</h2>
            <p>
              Workspace Owners are responsible for invitations, access roles,
              lawful use of member information and removing access when no
              longer required.
            </p>
          </section>
          <section>
            <h2>Early-access status</h2>
            <p>
              This is an early-access product. These draft terms should be
              reviewed by a qualified legal professional before public launch.
            </p>
          </section>
        </div>
      </main>
    </PageShell>
  );
}
