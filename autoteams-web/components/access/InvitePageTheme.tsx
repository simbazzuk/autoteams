"use client";

import { useEffect } from "react";

export function InvitePageTheme() {
  useEffect(() => {
    document.documentElement.dataset.autoteamsInvitePage = "true";

    return () => {
      delete document.documentElement.dataset.autoteamsInvitePage;
    };
  }, []);

  return null;
}
