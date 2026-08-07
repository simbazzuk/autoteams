import { NextResponse } from "next/server";
import {
  getAutoTeamsRuntimeConfig,
} from "@/lib/config/autoteams-config";
import {
  isFirebasePublicConfigComplete,
} from "@/lib/config/firebase-public-config";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = getAutoTeamsRuntimeConfig();

  return NextResponse.json({
    recommendationEngine:
      config.recommendationEngine,
    storageEngine:
      config.storageEngine,
    authProvider:
      config.authProvider,
    firebaseConfigured:
      isFirebasePublicConfigComplete(),
  });
}
