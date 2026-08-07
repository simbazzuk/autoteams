import {
  readStorageEngine,
  type StorageEngine,
} from "@/lib/config/autoteams-config";

export type StorageEngineStatus = {
  engine: StorageEngine;
  persistent: boolean;
  sharedAcrossDevices: boolean;
};

export function getStorageEngineStatus(): StorageEngineStatus {
  const engine = readStorageEngine();

  if (engine === "firebase") {
    return {
      engine,
      persistent: true,
      sharedAcrossDevices: true,
    };
  }

  return {
    engine: "local",
    persistent: true,
    sharedAcrossDevices: false,
  };
}

/**
 * Phase 0 foundation only.
 *
 * Existing AutoTeams repositories still use the current localStorage
 * implementation. Phase 1 will introduce repository adapters and route
 * workspace/people/team/profile persistence through this engine selector.
 */
export function assertStorageEngineReady(): void {
  const engine = readStorageEngine();

  if (engine === "firebase") {
    throw new Error(
      "Firebase storage is selected but repository migration has not been enabled yet. Install AutoTeams v4.0 Phase 1 before using AUTOTEAMS_STORAGE_ENGINE=firebase.",
    );
  }
}
