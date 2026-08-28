import { NextRequest, NextResponse } from "next/server";

type InviteEmailPayload = {
  token: string;
  ownerId: string;
  recipientName: string;
  recipientEmail: string;
  profileContext?: string;
  role: "owner" | "admin" | "leader" | "member";
  inviterName?: string;
};

const PROFILE_LABELS: Record<string, string> = {
  business: "Work",
  sports: "Sport",
  friendship: "Friendship",
  community: "Community",
  education: "Education",
};

const ROLE_LABELS: Record<InviteEmailPayload["role"], string> = {
  owner: "Owner",
  admin: "Administrator",
  leader: "Team Leader",
  member: "Team Member",
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function verifyFirebaseUser(
  idToken: string,
): Promise<{ uid: string; email?: string; displayName?: string }> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_FIREBASE_API_KEY is not configured.");
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Firebase authentication token could not be verified.");
  }

  const body = (await response.json()) as {
    users?: Array<{
      localId?: string;
      email?: string;
      displayName?: string;
    }>;
  };

  const user = body.users?.[0];

  if (!user?.localId) {
    throw new Error("Firebase user could not be resolved.");
  }

  return {
    uid: user.localId,
    email: user.email,
    displayName: user.displayName,
  };
}

async function graphAccessToken() {
  const tenantId = process.env.MS_TENANT_ID;
  const clientId = process.env.MS_CLIENT_ID;
  const clientSecret = process.env.MS_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error(
      "Microsoft Graph credentials are not configured.",
    );
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  });

  const response = await fetch(
    `https://login.microsoftonline.com/${encodeURIComponent(
      tenantId,
    )}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `Microsoft token request failed (${response.status}): ${detail}`,
    );
  }

  const payload = (await response.json()) as {
    access_token?: string;
  };

  if (!payload.access_token) {
    throw new Error("Microsoft access token was not returned.");
  }

  return payload.access_token;
}

function inviteEmailHtml(
  payload: InviteEmailPayload,
  inviteUrl: string,
) {
  const firstName =
    payload.recipientName.trim().split(/\s+/)[0] || "there";

  const inviter =
    payload.inviterName?.trim() || "A TeamScience.ai member";

  const profile =
    PROFILE_LABELS[payload.profileContext ?? ""] || "TeamScience.ai";

  const role = ROLE_LABELS[payload.role];

  return `<!doctype html>
<html>
  <body style="margin:0;background:#08111f;font-family:Arial,Helvetica,sans-serif;color:#eaf0ff">
    <div style="max-width:680px;margin:0 auto;padding:40px 20px">
      <div style="padding:34px;border:1px solid #293650;border-radius:24px;background:linear-gradient(145deg,#121d31,#0b1322)">
        <div style="font-size:12px;font-weight:800;letter-spacing:.13em;color:#a78bfa">TEAMSCIENCE.AI INVITATION</div>

        <h1 style="margin:18px 0 12px;font-size:38px;line-height:1.05;color:#ffffff">
          You're invited to TeamScience.ai
        </h1>

        <p style="margin:0 0 22px;color:#aebbd0;font-size:16px;line-height:1.65">
          Hi ${escapeHtml(firstName)}, ${escapeHtml(inviter)} has invited you
          to join their <strong style="color:#ffffff">${escapeHtml(profile)}</strong>
          profile context.
        </p>

        <div style="display:block;margin:22px 0;padding:18px;border-radius:16px;background:#0f1a2d;border:1px solid #26334b">
          <div style="margin-bottom:10px">
            <span style="display:inline-block;width:110px;color:#74839c;font-size:12px">PROFILE</span>
            <strong style="color:#fff">${escapeHtml(profile)}</strong>
          </div>
          <div>
            <span style="display:inline-block;width:110px;color:#74839c;font-size:12px">ROLE</span>
            <strong style="color:#fff">${escapeHtml(role)}</strong>
          </div>
        </div>

        <a href="${escapeHtml(inviteUrl)}"
           style="display:inline-block;padding:14px 22px;border-radius:12px;background:linear-gradient(135deg,#7c3aed,#2563eb);color:#fff;text-decoration:none;font-weight:800">
          Join TeamScience.ai →
        </a>

        <p style="margin:26px 0 0;color:#718097;font-size:12px;line-height:1.55">
          TeamScience.ai helps people understand strengths, compatibility and build better teams.
          This invitation was sent to ${escapeHtml(payload.recipientEmail)}.
        </p>
      </div>

      <p style="text-align:center;color:#56657d;font-size:11px;margin:18px 0">
        © AutoTeams · AI-powered team intelligence
      </p>
    </div>
  </body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const authorization =
      request.headers.get("authorization") ?? "";

    if (!authorization.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    const idToken = authorization.slice("Bearer ".length);
    const authenticatedUser =
      await verifyFirebaseUser(idToken);

    const payload =
      (await request.json()) as InviteEmailPayload;

    if (
      !payload.token ||
      !payload.ownerId ||
      !payload.recipientEmail ||
      !payload.role
    ) {
      return NextResponse.json(
        { error: "Invitation payload is incomplete." },
        { status: 400 },
      );
    }

    if (payload.ownerId !== authenticatedUser.uid) {
      return NextResponse.json(
        { error: "Invitation owner does not match signed-in user." },
        { status: 403 },
      );
    }

    const sender =
      process.env.MS_SENDER_EMAIL || "info@autoteams.app";

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://autoteams.app";

    const inviteUrl =
      `${appUrl.replace(/\/$/, "")}/invite/${encodeURIComponent(
        payload.token,
      )}`;

    const accessToken = await graphAccessToken();

    const graphResponse = await fetch(
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(
        sender,
      )}/sendMail`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            subject: `${payload.inviterName || "Someone"} invited you to TeamScience.ai`,
            body: {
              contentType: "HTML",
              content: inviteEmailHtml(payload, inviteUrl),
            },
            toRecipients: [
              {
                emailAddress: {
                  address: payload.recipientEmail,
                  name: payload.recipientName,
                },
              },
            ],
          },
          saveToSentItems: true,
        }),
        cache: "no-store",
      },
    );

    if (!graphResponse.ok) {
      const detail = await graphResponse.text();

      console.error(
        "[AutoTeams] Microsoft Graph sendMail failed",
        graphResponse.status,
        detail,
      );

      return NextResponse.json(
        {
          error: "Microsoft 365 could not send the invitation email.",
          detail:
            process.env.NODE_ENV === "development"
              ? detail
              : undefined,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      inviteUrl,
      sender,
    });
  } catch (error) {
    console.error(
      "[AutoTeams] invitation email failed",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invitation email failed.",
      },
      { status: 500 },
    );
  }
}
