import {
  getAutoTeamsRuntimeConfig,
} from "@/lib/config/autoteams-config";
import {
  isFirebasePublicConfigComplete,
} from "@/lib/config/firebase-public-config";

export type FirebaseFoundationStatus = {
  configured: boolean;
  storageSelected: boolean;
  authSelected: boolean;
  readyForMigration: boolean;
};

export function getFirebaseFoundationStatus(): FirebaseFoundationStatus {
  const config =
    getAutoTeamsRuntimeConfig();

  const configured =
    isFirebasePublicConfigComplete();

  return {
    configured,
    storageSelected:
      config.storageEngine === "firebase",
    authSelected:
      config.authProvider === "firebase",
    readyForMigration: configured,
  };
}
