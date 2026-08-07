import {
  NextResponse,
} from "next/server";
import {
  getFirebaseFoundationStatus,
} from "@/lib/firebase/status";
import {
  getAutoTeamsRuntimeConfig,
} from "@/lib/config/autoteams-config";

export const dynamic =
  "force-dynamic";

export async function GET() {
  return NextResponse.json({
    runtime:
      getAutoTeamsRuntimeConfig(),
    firebase:
      getFirebaseFoundationStatus(),
    phase: "v4.0-phase1",
  });
}
