import {
  loadContextualProfiles,
  saveContextualProfiles,
  type ContextualProfile,
} from "@/lib/contextual-profiles";
import type {
  ProfileRepository,
} from "@/lib/repositories/types";

export class LocalProfileRepository
  implements ProfileRepository
{
  async list(): Promise<
    ContextualProfile[]
  > {
    return loadContextualProfiles();
  }

  async save(
    profiles: ContextualProfile[],
  ): Promise<void> {
    saveContextualProfiles(
      profiles,
    );
  }
}
