import {
  NextResponse,
} from "next/server";
import {
  getAutoTeamsRuntimeConfig,
} from "@/lib/config/autoteams-config";
import {
  getFirebaseFoundationStatus,
} from "@/lib/firebase/status";

export const dynamic =
  "force-dynamic";

export async function GET() {
  return NextResponse.json({
    runtime:
      getAutoTeamsRuntimeConfig(),
    firebase:
      getFirebaseFoundationStatus(),
    authPhase:
      "v4.0-phase2",
    googleSignIn:
      "client-side",
    workspaceMemberships:
      "foundation-ready",
  });
}
