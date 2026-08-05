"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "./AuthProvider";

export function AccountMenu() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [working, setWorking] = useState(false);

  async function signOutUser() {
    setWorking(true);
    try { await logout(); router.push("/"); }
    finally { setWorking(false); }
  }

  if (loading) return <span className="account-menu-placeholder" />;

  if (!user) {
    return <div className="signed-out-actions"><Link href="/login">Log in</Link><Link className="button small" href="/signup">Sign up</Link></div>;
  }

  const name = user.displayName || user.email?.split("@")[0] || "Member";
  return (
    <details className="account-menu">
      <summary>
        <span className="account-avatar">{name.charAt(0).toUpperCase()}</span>
        <span className="account-name">{name.split(" ")[0]}</span>
        <span className="account-chevron">⌄</span>
      </summary>
      <div className="account-menu-panel">
        <div className="account-menu-identity"><strong>{name}</strong><small>{user.email}</small></div>
        <Link href="/dashboard"><span>⌂</span> Dashboard</Link>
        <Link href="/register"><span>＋</span> Create Persona</Link>
        <Link href="/trust-centre"><span>⚙</span> Privacy & Trust</Link>
        <hr />
        <button disabled={working} onClick={signOutUser} type="button"><span>↪</span> {working ? "Signing out…" : "Sign out"}</button>
      </div>
    </details>
  );
}
