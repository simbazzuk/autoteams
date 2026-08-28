"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  WorkspaceInvitation,
  loadInvitations,
} from "@/lib/workspace-access";

function profileLabel(
  value?: WorkspaceInvitation["profileContext"],
) {
  switch (value) {
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
      return "TeamScience.ai";
  }
}

export default function InvitePage() {
  const params = useParams<{ token: string }>();
  const token = decodeURIComponent(params?.token ?? "");
  const [ready, setReady] = useState(false);
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([]);

  useEffect(() => {
    setInvitations(loadInvitations());
    setReady(true);
  }, []);

  const invitation = useMemo(
    () =>
      invitations.find(
        (item) =>
          item.token === token &&
          item.status === "pending",
      ),
    [invitations, token],
  );

  if (!ready) {
    return (
      <main style={pageStyle}>
        <section style={cardStyle}>
          <span style={eyebrowStyle}>AUTOTEAMS INVITATION</span>
          <h1 style={titleStyle}>Loading your invitation...</h1>
        </section>
      </main>
    );
  }

  if (!invitation) {
    return (
      <main style={pageStyle}>
        <section style={cardStyle}>
          <span style={eyebrowStyle}>AUTOTEAMS INVITATION</span>
          <h1 style={titleStyle}>This invite is not available.</h1>
          <p style={bodyStyle}>
            The invitation may have expired, already been accepted, or belongs
            to a different browser/device.
          </p>
          <Link href="/" style={buttonStyle}>
            Go to AutoTeams
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <span style={eyebrowStyle}>YOU'RE INVITED</span>

        <div style={iconStyle}>✦</div>

        <h1 style={titleStyle}>Join AutoTeams</h1>

        <p style={bodyStyle}>
          You have been invited to the{" "}
          <strong style={{ color: "#fff" }}>
            {profileLabel(invitation.profileContext)}
          </strong>{" "}
          profile context.
        </p>

        <div style={detailGridStyle}>
          <div style={detailStyle}>
            <small style={detailLabelStyle}>INVITED AS</small>
            <strong>{invitation.name || invitation.email}</strong>
          </div>

          <div style={detailStyle}>
            <small style={detailLabelStyle}>EMAIL</small>
            <strong>{invitation.email}</strong>
          </div>

          <div style={detailStyle}>
            <small style={detailLabelStyle}>ROLE</small>
            <strong>
              {invitation.role === "owner"
                ? "Owner"
                : invitation.role === "admin"
                  ? "Administrator"
                  : invitation.role === "leader"
                    ? "Team Leader"
                    : "Team Member"}
            </strong>
          </div>

          <div style={detailStyle}>
            <small style={detailLabelStyle}>PROFILE</small>
            <strong>{profileLabel(invitation.profileContext)}</strong>
          </div>
        </div>

        <div style={actionsStyle}>
          <Link
            href={`/register?invite=${encodeURIComponent(invitation.token)}`}
            style={buttonStyle}
          >
            Join AutoTeams →
          </Link>

          <Link href="/login" style={secondaryButtonStyle}>
            I already have an account
          </Link>
        </div>

        <p style={footnoteStyle}>
          Your TeamScience.ai profile belongs to you. This invitation gives you
          access to participate in the selected profile context.
        </p>
      </section>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: 24,
  background:
    "radial-gradient(circle at 70% 10%, rgba(99,102,241,.18), transparent 32%), #0b1220",
  color: "#f8fafc",
};

const cardStyle: React.CSSProperties = {
  width: "min(100%, 680px)",
  padding: "42px",
  borderRadius: 24,
  border: "1px solid rgba(129,140,248,.3)",
  background:
    "linear-gradient(155deg, rgba(99,102,241,.10), rgba(15,23,42,.96) 45%)",
  boxShadow: "0 32px 100px rgba(2,6,23,.45)",
};

const eyebrowStyle: React.CSSProperties = {
  display: "inline-block",
  marginBottom: 22,
  color: "#a78bfa",
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: ".14em",
};

const iconStyle: React.CSSProperties = {
  display: "grid",
  placeItems: "center",
  width: 54,
  height: 54,
  marginBottom: 18,
  borderRadius: 16,
  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
  fontSize: 26,
};

const titleStyle: React.CSSProperties = {
  margin: "0 0 12px",
  fontSize: "clamp(2.4rem,6vw,4.2rem)",
  lineHeight: .98,
  letterSpacing: "-.045em",
};

const bodyStyle: React.CSSProperties = {
  color: "#a9b7cf",
  fontSize: 17,
  lineHeight: 1.65,
};

const detailGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2,minmax(0,1fr))",
  gap: 12,
  margin: "28px 0",
};

const detailStyle: React.CSSProperties = {
  display: "grid",
  gap: 5,
  padding: 14,
  borderRadius: 14,
  border: "1px solid rgba(148,163,184,.14)",
  background: "rgba(7,13,27,.55)",
};

const detailLabelStyle: React.CSSProperties = {
  color: "#7f8eaa",
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: ".08em",
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  marginTop: 26,
};

const buttonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "13px 18px",
  borderRadius: 13,
  background: "linear-gradient(135deg,#7c6cff,#5ea2ff)",
  color: "white",
  textDecoration: "none",
  fontWeight: 850,
};

const secondaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: "rgba(99,102,241,.08)",
  border: "1px solid rgba(129,140,248,.28)",
};

const footnoteStyle: React.CSSProperties = {
  margin: "24px 0 0",
  paddingTop: 18,
  borderTop: "1px solid rgba(148,163,184,.13)",
  color: "#74839d",
  fontSize: 12,
  lineHeight: 1.55,
};
