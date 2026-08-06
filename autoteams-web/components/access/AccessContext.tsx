"use client";

import { useEffect, useMemo, useState } from "react";
import { loadCurrentAccount } from "@/lib/access-bootstrap";
import {
  WorkspaceMembership,
  WorkspaceRole,
  loadMemberships,
} from "@/lib/workspace-access";
import { loadActiveWorkspaceId } from "@/lib/workspaces";

export function useWorkspaceAccess(workspaceId?: string) {
  const [accountId, setAccountId] = useState("");
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(
    workspaceId || "",
  );
  const [memberships, setMemberships] = useState<WorkspaceMembership[]>([]);

  useEffect(() => {
    const account = loadCurrentAccount();
    setAccountId(account.userId);
    setActiveWorkspaceId(workspaceId || loadActiveWorkspaceId());
    setMemberships(loadMemberships());
  }, [workspaceId]);

  const membership = useMemo(
    () =>
      memberships.find(
        (item) =>
          item.workspaceId === activeWorkspaceId &&
          item.userId === accountId &&
          item.status === "active",
      ) || null,
    [accountId, activeWorkspaceId, memberships],
  );

  return {
    currentUserId: accountId,
    activeWorkspaceId,
    membership,
    role: (membership?.role || null) as WorkspaceRole | null,
    memberships,
    refresh: () => setMemberships(loadMemberships()),
  };
}
