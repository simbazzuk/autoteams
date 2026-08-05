"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { loadNotifications } from "@/lib/notifications";

export function AccountMenu() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [working, setWorking] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    setUnread(loadNotifications().filter((item) => !item.read).length);
  }, []);

  async function signOutUser() {
    setWorking(true);
    try {
      await logout();
      router.push("/");
    } finally {
      setWorking(false);
    }
  }

  if (loading) return <span className="account-menu-placeholder" />;

  if (!user) {
    return (
      <div className="signed-out-actions">
        <Link href="/login">Log in</Link>
        <Link className="button small" href="/signup">Start free</Link>
      </div>
    );
  }

  const name = user.displayName || user.email?.split("@")[0] || "Member";

  return (
    <div className="account-cluster">
      <Link className="notification-button" href="/notifications" aria-label="Notifications">
        <span>◔</span>
        {unread > 0 && <em>{unread}</em>}
      </Link>

      <details className="account-menu">
        <summary>
          <span className="account-avatar">{name.charAt(0).toUpperCase()}</span>
          <span className="account-name">{name.split(" ")[0]}</span>
          <span className="account-chevron">⌄</span>
        </summary>
        <div className="account-menu-panel">
          <div className="account-menu-identity">
            <strong>{name}</strong>
            <small>{user.email}</small>
          </div>
          <Link href="/dashboard"><span>⌂</span> Dashboard</Link>
          <Link href="/team-canvas"><span>◫</span> Team Canvas</Link>
          <Link href="/settings"><span>⚙</span> Settings</Link>
          <Link href="/trust-centre"><span>◇</span> Privacy & Trust</Link>
          <hr />
          <button disabled={working} onClick={signOutUser} type="button">
            <span>↪</span> {working ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </details>
    </div>
  );
}
