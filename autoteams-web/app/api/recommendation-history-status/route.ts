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
    release:
      "v5.0.0",
    recommendationPersistence:
      "firebase-client-authorised",
    collection:
      "recommendations",
    immutableHistory:
      true,
  });
}
