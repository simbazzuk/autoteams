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
    identityPhase:
      "v4.0-phase2.5",
    accountMenu:
      "firebase-aware",
    userBootstrap:
      "users/{uid}",
    lastLoginTracking:
      true,
  });
}
