"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "./AuthProvider";

export function AccountNav() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [working, setWorking] = useState(false);

  async function handleLogout() {
    setWorking(true);
    try {
      await logout();
      router.push("/");
    } finally {
      setWorking(false);
    }
  }

  if (loading) {
    return <span className="nav-account-placeholder" />;
  }

  if (!user) {
    return (
      <div className="nav-account">
        <Link className="nav-login" href="/login">
          Log in
        </Link>
        <Link className="button small" href="/signup">
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="nav-account">
      <Link className="nav-login" href="/dashboard">
        Dashboard
      </Link>
      <button
        className="button secondary small"
        disabled={working}
        onClick={handleLogout}
        type="button"
      >
        {working ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}
