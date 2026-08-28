import Link from "next/link";
import styles from "./EnterpriseTrustSecurity.module.css";

const securityAtAGlance = [
  ["🔐", "Secure authentication", "Account access is authenticated before protected workspace features are available."],
  ["👥", "Role-based workspace access", "Administrator, Team Leader and Member roles separate workspace responsibilities."],
  ["🏢", "Workspace boundaries", "Team activity and recommendations operate within the active workspace and selected population."],
  ["👤", "Profile controls", "Members control profile visibility, matching eligibility and approved discovery settings."],
  ["✦", "Controlled Atlas context", "Atlas should receive only the information required for the requested team or support task."],
  ["🧭", "Human review", "Atlas recommendations are decision support. People remain responsible for final team decisions."],
];

const accessRows = [
  ["Basic member/profile information", "Own profile", "Approved workspace use", "Workspace administration", "When required for the task"],
  ["Atlas profile signals", "Own signals", "According to profile sharing", "According to authorised access", "When required for analysis"],
  ["Team membership", "Relevant teams", "Relevant teams", "Workspace teams", "When required for team analysis"],
  ["Workspace settings", "No", "Limited", "Yes", "No"],
  ["Passwords / authentication secrets", "Never exposed", "Never exposed", "Never exposed", "Never exposed"],
];

const currentControls = [
  ["Authentication", "Protected application access and verified account identity are handled separately from team intelligence."],
  ["Authorisation", "Workspace roles and membership determine what people can manage inside a workspace."],
  ["Profile privacy", "Profile visibility, team-matching eligibility and approved discovery are controlled per profile."],
  ["Workspace isolation", "Atlas team analysis is scoped to the active workspace and selected population."],
  ["Explainability", "Recommendations expose evidence, confidence, strengths, gaps and risks for human review."],
  ["Data minimisation", "AutoTeams should use information relevant to the requested profile, team or support task rather than unrelated workspace data."],
];

const plannedControls = [
  "Enterprise SSO / SAML / OIDC",
  "Organisation-wide MFA enforcement",
  "SCIM user provisioning and de-provisioning",
  "Enterprise audit and administrator reporting",
  "Configurable retention policies",
  "Organisation security policies",
  "Data-residency options where supported",
  "Enterprise integration and security review packs",
];

export function EnterpriseTrustSecurity() {
  return (
    <section
      className={styles.section}
      data-autoteams-enterprise-trust-v7156="true"
    >
      <div className={styles.heading}>
        <span>ENTERPRISE TRUST &amp; SECURITY</span>
        <h2>Understand who can access what — and what Atlas can see.</h2>
        <p>
          Corporate adoption depends on clear boundaries. TeamScience.ai separates
          account access, workspace permissions, profile privacy and Atlas
          processing so organisations can understand how people and data are
          used.
        </p>
      </div>

      <div className={styles.glance}>
        {securityAtAGlance.map(([icon, title, text]) => (
          <article key={title}>
            <span>{icon}</span>
            <div>
              <strong>{title}</strong>
              <p>{text}</p>
            </div>
          </article>
        ))}
      </div>

      <div className={styles.twoColumn}>
        <article className={styles.panel}>
          <span className={styles.kicker}>ACCESS &amp; CONFIDENTIALITY</span>
          <h3>Who can see my information?</h3>
          <p>
            Access depends on workspace membership, role, profile visibility
            and the context in which information is being used.
          </p>

          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Information</th>
                  <th>Member</th>
                  <th>Team Leader</th>
                  <th>Administrator</th>
                  <th>Atlas</th>
                </tr>
              </thead>
              <tbody>
                {accessRows.map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell, index) => (
                      index === 0
                        ? <th key={`${row[0]}-${index}`}>{cell}</th>
                        : <td key={`${row[0]}-${index}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.note}>
            <strong>Your profile belongs to you.</strong>
            <span>
              Atlas Profiles remain personal. Workspace access should use only
              the profile information made available for the relevant team,
              matching or approved discovery purpose.
            </span>
          </div>
        </article>

        <article className={styles.panel}>
          <span className={styles.kicker}>ATLAS &amp; YOUR DATA</span>
          <h3>Only the context needed for the task.</h3>
          <p>
            When Atlas generates a recommendation or Team Insight, TeamScience.ai
            should send the profile, team and requirement information needed
            for that analysis — not passwords, authentication credentials or
            unrelated workspace information.
          </p>

          <div className={styles.flow}>
            <div>
              <small>01</small>
              <strong>Workspace</strong>
              <span>Relevant people, profiles and team requirement</span>
            </div>
            <b>→</b>
            <div>
              <small>02</small>
              <strong>TeamScience.ai</strong>
              <span>Applies workspace and profile controls</span>
            </div>
            <b>→</b>
            <div>
              <small>03</small>
              <strong>Atlas</strong>
              <span>Analyses the information required for the task</span>
            </div>
            <b>→</b>
            <div>
              <small>04</small>
              <strong>Human review</strong>
              <span>Recommendation is reviewed before use</span>
            </div>
          </div>

          <div className={styles.warning}>
            <strong>AI processing transparency</strong>
            <span>
              Model-provider training, processing location, retention and
              sub-processor statements must match the production configuration
              and contractual terms. TeamScience.ai should not make stronger claims
              until those settings and terms are verified.
            </span>
          </div>
        </article>
      </div>

      <div className={styles.controls}>
        <div>
          <span className={styles.kicker}>CURRENT PRODUCT CONTROLS</span>
          <h3>Controls TeamScience.ai can explain today.</h3>
        </div>
        <div className={styles.controlGrid}>
          {currentControls.map(([title, text]) => (
            <article key={title}>
              <strong>{title}</strong>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>

      <div className={styles.enterprise}>
        <div>
          <span className={styles.kicker}>ENTERPRISE ROADMAP</span>
          <h3>Controls corporate customers are likely to request.</h3>
          <p>
            These are roadmap capabilities, not claims about the current MVP.
          </p>
        </div>

        <div className={styles.plannedGrid}>
          {plannedControls.map((item) => (
            <span key={item}>
              <i>PLANNED</i>
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.dataLifecycle}>
        <div>
          <span className={styles.kicker}>DATA LIFECYCLE</span>
          <h3>Corporate questions TeamScience.ai should answer clearly.</h3>
        </div>

        <div>
          <article><strong>Collection</strong><p>What information is collected and why is it required?</p></article>
          <article><strong>Access</strong><p>Which workspace roles and profile settings allow it to be used?</p></article>
          <article><strong>AI processing</strong><p>Which information is sent for a specific Atlas task?</p></article>
          <article><strong>Retention</strong><p>How long are profiles, invitations, teams, recommendations and support conversations retained?</p></article>
          <article><strong>Export &amp; deletion</strong><p>How can a member request, export, correct or delete their information?</p></article>
          <article><strong>Incident response</strong><p>How can a customer report a security or privacy concern?</p></article>
        </div>
      </div>

      <div className={styles.footer}>
        <p>
          This page describes TeamScience.ai product controls and intended design
          principles. It is not a certification, contractual security schedule
          or final legal privacy notice.
        </p>
        <div>
          <Link href="/profile/privacy">Profile Privacy</Link>
          <Link href="/profile/security">Account Security</Link>
          <Link href="/members">Members &amp; Roles</Link>
        </div>
      </div>
    </section>
  );
}