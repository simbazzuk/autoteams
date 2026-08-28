"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  WorkspaceInvitation,
  loadInvitations,
} from "@/lib/workspace-access";

function contextLabel(
  context?: WorkspaceInvitation["profileContext"],
) {
  switch (context) {
    case "business":
      return "Work";
    case "sports":
      return "Sport";
    case "friendship":
      return "Friendship";
    case "community":
      return "Community";
    case "education":
      return "Education";
    default:
      return "AutoTeams";
  }
}

function roleLabel(role?: WorkspaceInvitation["role"]) {
  switch (role) {
    case "owner":
      return "Owner";
    case "admin":
      return "Administrator";
    case "leader":
      return "Team Leader";
    default:
      return "Team Member";
  }
}

export function InviteRegistrationExperience() {
  const searchParams = useSearchParams();
  const token = searchParams.get("invite") ?? "";
  const [ready, setReady] = useState(false);
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([]);

  useEffect(() => {
    if (!token) return;

    const items = loadInvitations();
    setInvitations(items);
    setReady(true);

    document.documentElement.dataset.autoteamsInviteRegister = "true";

    // Hide the generic registration hero. We do this by exact visible text so
    // this patch remains compatible with the current registration component.
    const headings = Array.from(
      document.querySelectorAll("h1,h2,h3,p"),
    );

    const genericHero = headings.find((node) =>
      node.textContent?.includes("One account."),
    );

    const genericSubtitle = headings.find((node) =>
      node.textContent?.includes(
        "Choose a team type and AutoTeams asks only the questions relevant to that experience.",
      ),
    );

    if (genericSubtitle instanceof HTMLElement) {
      genericSubtitle.dataset.autoteamsGenericRegisterSubtitle = "true";
    }

    if (genericHero) {
      const container =
        genericHero.closest("section") ??
        genericHero.parentElement;

      if (container instanceof HTMLElement) {
        container.dataset.autoteamsGenericRegisterHero = "true";
      }
    }

    const coreHeading = headings.find((node) =>
      node.textContent?.includes("Confirm your core profile"),
    );

    if (coreHeading instanceof HTMLElement) {
      coreHeading.dataset.autoteamsCoreHeading = "true";

      // v7.13.36-fix1: tag the actual Step 1 surface instead of trying
      // to guess its generated class name from global CSS.
      const formSurface =
        coreHeading.closest("section") ??
        coreHeading.closest("form") ??
        coreHeading.parentElement?.parentElement ??
        coreHeading.parentElement;

      if (formSurface instanceof HTMLElement) {
        formSurface.dataset.autoteamsInviteFormSurface = "true";
      }
    }

    return () => {
      delete document.documentElement.dataset.autoteamsInviteRegister;
    };
  }, [token]);

  const invitation = useMemo(
    () =>
      invitations.find(
        (item) =>
          item.token === token &&
          item.status === "pending",
      ),
    [invitations, token],
  );

  if (!token) return null;

  if (!ready) {
    return (
      <section className="invite-register-hero">
        <span className="invite-register-eyebrow">
          AUTOTEAMS INVITATION
        </span>
        <h1>Loading your invitation...</h1>
      </section>
    );
  }

  if (!invitation) {
    return (
      <section className="invite-register-hero invite-register-error">
        <span className="invite-register-eyebrow">
          INVITATION
        </span>
        <h1>Invitation details unavailable</h1>
        <p>
          This invite cannot be resolved in this browser. For the production
          invitation flow, invitations will need to be stored centrally rather
          than only in local browser storage.
        </p>
      </section>
    );
  }

  const profile = contextLabel(invitation.profileContext);

  return (
    <section className="invite-register-hero">
      <div className="invite-register-top">
        <span className="invite-register-eyebrow">
          YOU'RE INVITED
        </span>
        <span className="invite-register-token">
          Invite {invitation.token}
        </span>
      </div>

      <div className="invite-register-title-row">
        <div className="invite-register-icon">✦</div>
        <div>
          <h1>Join AutoTeams</h1>
          <p>
            You have been invited to participate in the{" "}
            <strong>{profile}</strong> profile context as a{" "}
            <strong>{roleLabel(invitation.role)}</strong>.
          </p>
        </div>
      </div>

      <div className="invite-register-details">
        <div>
          <small>PROFILE</small>
          <strong>{profile}</strong>
        </div>
        <div>
          <small>INVITED EMAIL</small>
          <strong>{invitation.email}</strong>
        </div>
        <div>
          <small>ROLE</small>
          <strong>{roleLabel(invitation.role)}</strong>
        </div>
      </div>

      <div className="invite-register-journey">
        <span className="active">1 Confirm details</span>
        <span>2 Create profile</span>
        <span>3 Join {profile}</span>
      </div>

      <p className="invite-register-note">
        Confirm your account details below. Your AutoTeams profile remains
        yours; the invitation simply connects you to this profile context.
      </p>
    </section>
  );
}
