import type {
  Workspace,
  WorkspacePerson,
} from "@/lib/workspaces";
import type {
  ContextualProfile,
} from "@/lib/contextual-profiles";

export type SavedTeamRecord = {
  id: string;
  workspaceId: string;
  name: string;
  purpose: string;
  personIds: string[];
  createdAt: string;
  confidence: number;
  recommendation?: {
    source: "gemini" | "fallback";
    model?: string;
    summary: string;
    teamStrengths: string[];
    skillGaps: string[];
    risks: string[];
    responseTimeMs?: number;
    totalTokens?: number;
  };
};

export type RecommendationReviewRecord = {
  teamId: string;
  status:
    | "draft"
    | "reviewed"
    | "published";
  reviewedAt?: string;
  publishedAt?: string;
  reviewerNote?: string;
};

export interface WorkspaceRepository {
  list(): Promise<Workspace[]>;
  save(
    workspaces: Workspace[],
  ): Promise<void>;
  getActiveId(): Promise<string>;
  setActiveId(
    workspaceId: string,
  ): Promise<void>;
}

export interface PeopleRepository {
  list(): Promise<WorkspacePerson[]>;
  save(
    people: WorkspacePerson[],
  ): Promise<void>;
}

export interface ProfileRepository {
  list(): Promise<ContextualProfile[]>;
  save(
    profiles: ContextualProfile[],
  ): Promise<void>;
}

export interface TeamRepository {
  list(): Promise<SavedTeamRecord[]>;
  save(
    teams: SavedTeamRecord[],
  ): Promise<void>;
}

export interface RecommendationReviewRepository {
  list(): Promise<
    RecommendationReviewRecord[]
  >;
  save(
    reviews:
      RecommendationReviewRecord[],
  ): Promise<void>;
}
