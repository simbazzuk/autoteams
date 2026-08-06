"use client";

import Link from "next/link";
import { useState } from "react";
import {
  deleteRegistrationProfile,
  exportRegistrationData,
} from "@/lib/registration-profile";
import {
  TrustActionCard,
  TrustCard,
  TrustHero,
  TrustSectionHeading,
} from "@/components/trust/TrustComponents";

export function PrivacyCentre() {
  const [message, setMessage] = useState("");

  function downloadData() {
    const blob = new Blob([exportRegistrationData()], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "autoteams-my-data.json";
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Your local AutoTeams profile export has been created.");
  }

  function deleteLocalData() {
    const confirmed = window.confirm(
      "Delete the local registration profile and consent preferences from this browser?",
    );
    if (!confirmed) return;
    deleteRegistrationProfile();
    setMessage("Local registration profile deleted.");
  }

  return (
    <main className="trust12-page">
      <TrustHero
        eyebrow="Privacy Centre"
        title="Understand and control your information."
        text="AutoTeams separates account registration, workspace access, Talent profiles and Team DNA consent so users can see what information is collected and why."
        primaryHref="/onboarding/profile"
        primaryLabel="Profile & Consent"
        secondaryHref="/trust-centre"
        secondaryLabel="Trust Centre"
      />

      <section className="trust12-section">
        <div className="container">
          <TrustSectionHeading
            eyebrow="Information categories"
            title="Collect only what the experience needs."
            text="Business, friendship, community and sports workspaces do not all require the same profile information."
          />

          <div className="trust12-card-grid">
            <TrustCard
              icon="01"
              title="Account information"
              text="Name, email, authentication provider, verification status and acceptance records."
            />
            <TrustCard
              icon="02"
              title="Workspace profile"
              text="Business profiles use job data; social profiles may use optional interests, age range and location."
            />
            <TrustCard
              icon="03"
              title="Team DNA consent"
              text="Users control profile visibility, matching, aggregated insights and friendship discovery."
            />
            <TrustCard
              icon="04"
              title="Sensitive information"
              text="Atlas must not infer protected characteristics from names, photos or written answers."
            />
          </div>
        </div>
      </section>

      <section className="trust12-section trust12-section-alt">
        <div className="container">
          <TrustSectionHeading
            eyebrow="Your controls"
            title="Manage the profile stored by this release."
            text="The current test release stores profile and security preferences locally while Firebase handles authentication."
          />

          <div className="trust12-action-grid">
            <TrustActionCard
              title="Download my data"
              text="Export the profile, consent and security preferences stored in this browser."
              action={
                <button className="button" onClick={downloadData} type="button">
                  Download JSON
                </button>
              }
            />

            <TrustActionCard
              title="Delete local profile"
              text="Remove the local registration profile and consent preferences from this browser."
              action={
                <button
                  className="button secondary"
                  onClick={deleteLocalData}
                  type="button"
                >
                  Delete Local Data
                </button>
              }
            />

            <TrustActionCard
              title="Update profile and consent"
              text="Change which profile information Atlas may use for matching and aggregated insights."
              action={
                <Link className="button secondary" href="/onboarding/profile">
                  Review Consent
                </Link>
              }
            />

            <TrustActionCard
              title="Review security"
              text="Check email verification, session settings and the intended MFA policy."
              action={
                <Link className="button secondary" href="/security">
                  Security Centre
                </Link>
              }
            />
          </div>

          {message && <div className="trust12-success-message">{message}</div>}
        </div>
      </section>

      <section className="trust12-section">
        <div className="container trust12-privacy-principles">
          <div>
            <span className="eyebrow">Privacy principles</span>
            <h2>Clear purpose, limited visibility and user control.</h2>
            <p>
              These principles should remain true when the Cloud Edition moves
              profile and consent records from local storage into Firestore.
            </p>
          </div>

          <div className="trust12-promise-grid">
            {[
              "Only collect information required for the selected experience",
              "Keep workplace and friendship data separated",
              "Never expose full dates of birth",
              "Keep profile photographs optional",
              "Do not use photos for matching",
              "Allow users to update, export and delete their data",
            ].map((item) => (
              <div key={item}>
                <span>✓</span>
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
