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
    workspacePhase:
      "v4.0-phase3",
    migration:
      "client-authorised",
    localDataDeletion:
      false,
    firestoreCollections: [
      "workspaces",
      "workspaceMemberships",
      "userPreferences",
      "migrationStatus",
    ],
  });
}
