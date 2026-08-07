import {
  loadActiveWorkspaceId,
  loadWorkspaces,
  saveActiveWorkspaceId,
  saveWorkspaces,
  type Workspace,
} from "@/lib/workspaces";
import type {
  WorkspaceRepository,
} from "@/lib/repositories/types";

export class LocalWorkspaceRepository
  implements WorkspaceRepository
{
  async list(): Promise<Workspace[]> {
    return loadWorkspaces();
  }

  async save(
    workspaces: Workspace[],
  ): Promise<void> {
    saveWorkspaces(workspaces);
  }

  async getActiveId(): Promise<string> {
    return loadActiveWorkspaceId();
  }

  async setActiveId(
    workspaceId: string,
  ): Promise<void> {
    saveActiveWorkspaceId(
      workspaceId,
    );
  }
}
