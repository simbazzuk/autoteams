"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  NavigationRole,
  canAccessAdministration,
  resolveNavigationRole,
  roleDisplayName,
} from "@/lib/navigation-role";
import styles from "./AccountMenu.module.css";

export function AccountMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<NavigationRole>("member");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRole(resolveNavigationRole(user?.email));
  }, [user?.email]);

  useEffect(() => {
    function closeMenu(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  const name =
    user?.displayName?.trim() ||
    user?.email?.split("@")[0] ||
    "Account";

  const initial = name.charAt(0).toUpperCase();

  return (
    <div className={styles.menu} ref={menuRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className={styles.trigger}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className={styles.avatar}>{initial}</span>

        <span className={styles.identity}>
          <strong>{name}</strong>
          <small>{roleDisplayName(role)}</small>
        </span>

        <em aria-hidden="true">{open ? "⌃" : "⌄"}</em>
      </button>

      {open && (
        <div className={styles.dropdown} role="menu">
          <header className={styles.header}>
            <span className={styles.largeAvatar}>{initial}</span>
            <div>
              <strong>{name}</strong>
              <small>{roleDisplayName(role)}</small>
            </div>
          </header>

          <nav className={styles.links}>
            <Link href="/profile" onClick={() => setOpen(false)}>
              My Profile
            </Link>
            <Link href="/notifications" onClick={() => setOpen(false)}>
              Notifications
            </Link>
            <Link href="/settings" onClick={() => setOpen(false)}>
              Account Settings
            </Link>
            <Link href="/profile/privacy" onClick={() => setOpen(false)}>
              Privacy
            </Link>
            <Link href="/profile/security" onClick={() => setOpen(false)}>
              Security
            </Link>
          </nav>

          {canAccessAdministration(role) && (
            <>
              <div className={styles.divider} />
              <nav className={styles.links}>
                <Link
                  href="/profile/membership"
                  onClick={() => setOpen(false)}
                >
                  Workspace Membership
                </Link>
                <Link href="/demo" onClick={() => setOpen(false)}>
                  Demo Environment
                </Link>
              </nav>
            </>
          )}

          <div className={styles.divider} />

          <button
            className={styles.signOut}
            onClick={() => {
              setOpen(false);
              logout();
            }}
            type="button"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
