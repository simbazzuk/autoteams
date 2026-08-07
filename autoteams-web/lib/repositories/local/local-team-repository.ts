import type {
  SavedTeamRecord,
  TeamRepository,
} from "@/lib/repositories/types";

const TEAM_KEY =
  "autoteams-v20-saved-teams";

export class LocalTeamRepository
  implements TeamRepository
{
  async list(): Promise<
    SavedTeamRecord[]
  > {
    if (
      typeof window === "undefined"
    ) {
      return [];
    }

    try {
      const raw =
        window.localStorage.getItem(
          TEAM_KEY,
        );

      return raw
        ? (JSON.parse(
            raw,
          ) as SavedTeamRecord[])
        : [];
    } catch {
      return [];
    }
  }

  async save(
    teams: SavedTeamRecord[],
  ): Promise<void> {
    if (
      typeof window === "undefined"
    ) {
      return;
    }

    window.localStorage.setItem(
      TEAM_KEY,
      JSON.stringify(teams),
    );
  }
}
