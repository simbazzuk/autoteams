"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  acceptAtlasTeamInvitation,
  AtlasTeamInvitation,
  declineAtlasTeamInvitation,
  loadAtlasTeamInvitations,
} from "./atlas-team-invitations";
import styles from "./TeamInvitationCentre.module.css";

type Filter = "pending" | "accepted" | "declined" | "all";

export function TeamInvitationCentre() {
  const [invitations, setInvitations] =
    useState<AtlasTeamInvitation[]>([]);
  const [filter, setFilter] = useState<Filter>("pending");
  const [message, setMessage] = useState("");

  function refresh() {
    setInvitations(loadAtlasTeamInvitations());
  }

  useEffect(() => {
    refresh();

    window.addEventListener(
      "autoteams:atlas-team-invitations-changed",
      refresh,
    );

    return () =>
      window.removeEventListener(
        "autoteams:atlas-team-invitations-changed",
        refresh,
      );
  }, []);

  const visible = useMemo(
    () =>
      invitations.filter(
        item =>
          filter === "all" ||
          item.status === filter,
      ),
    [filter, invitations],
  );

  const counts = useMemo(
    () => ({
      pending: invitations.filter(item => item.status === "pending").length,
      accepted: invitations.filter(item => item.status === "accepted").length,
      declined: invitations.filter(item => item.status === "declined").length,
    }),
    [invitations],
  );

  function accept(invitation: AtlasTeamInvitation) {
    try {
      const result = acceptAtlasTeamInvitation(invitation.id);
      setMessage(
        `${result.personName} accepted the invitation to ${result.teamName}. The team has been updated.`,
      );
      refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "The invitation could not be accepted.",
      );
    }
  }

  function decline(invitation: AtlasTeamInvitation) {
    declineAtlasTeamInvitation(invitation.id);
    setMessage(
      `${invitation.personName} declined the invitation to ${invitation.teamName}.`,
    );
    refresh();
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Team invitations</span>
          <h1>Turn a recommendation into a real team.</h1>
          <p>
            Atlas can recommend who may strengthen a team, but the person
            remains in control. Invitations only change a team after they are
            accepted.
          </p>
        </div>

        <Link className={styles.backLink} href="/teams">
          ← My Teams
        </Link>
      </section>

      <section className={styles.stats}>
        <article>
          <span>Pending</span>
          <strong>{counts.pending}</strong>
        </article>
        <article>
          <span>Accepted</span>
          <strong>{counts.accepted}</strong>
        </article>
        <article>
          <span>Declined</span>
          <strong>{counts.declined}</strong>
        </article>
      </section>

      <nav className={styles.filters} aria-label="Invitation filters">
        {(["pending", "accepted", "declined", "all"] as Filter[]).map(item => (
          <button
            className={filter === item ? styles.activeFilter : ""}
            key={item}
            type="button"
            onClick={() => setFilter(item)}
          >
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </nav>

      {message && (
        <div className={styles.message} role="status">
          {message}
        </div>
      )}

      {visible.length > 0 ? (
        <section className={styles.list}>
          {visible.map(invitation => (
            <article
              className={styles.card}
              data-status={invitation.status}
              key={invitation.id}
            >
              <div className={styles.avatar}>
                {invitation.personName.charAt(0).toUpperCase()}
              </div>

              <div className={styles.details}>
                <header>
                  <div>
                    <span className={styles.status}>
                      {invitation.status}
                    </span>
                    <h2>{invitation.personName}</h2>
                    <p>
                      Invited to join <strong>{invitation.teamName}</strong>
                    </p>
                  </div>

                  {typeof invitation.score === "number" && (
                    <div className={styles.match}>
                      <strong>{invitation.score}%</strong>
                      <span>Atlas match</span>
                    </div>
                  )}
                </header>

                {invitation.personEmail && (
                  <small>{invitation.personEmail}</small>
                )}

                <div className={styles.meta}>
                  Invitation created{" "}
                  {new Date(invitation.createdAt).toLocaleString()}
                </div>

                {invitation.status === "pending" ? (
                  <div className={styles.actions}>
                    <button
                      className={styles.accept}
                      type="button"
                      onClick={() => accept(invitation)}
                    >
                      Accept invitation
                    </button>
                    <button
                      className={styles.decline}
                      type="button"
                      onClick={() => decline(invitation)}
                    >
                      Decline
                    </button>
                  </div>
                ) : (
                  <div className={styles.responded}>
                    {invitation.status === "accepted"
                      ? "Joined team"
                      : "Invitation declined"}
                    {invitation.respondedAt
                      ? ` · ${new Date(
                          invitation.respondedAt,
                        ).toLocaleString()}`
                      : ""}
                  </div>
                )}
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className={styles.empty}>
          <div>✦</div>
          <h2>No {filter === "all" ? "" : filter} invitations.</h2>
          <p>
            Use Recruit with Atlas on My Teams to recommend and invite someone.
          </p>
          <Link href="/teams">Open My Teams</Link>
        </section>
      )}

      <footer className={styles.principle}>
        <strong>Human decision remains central.</strong>{" "}
        Atlas recommends. A person accepts or declines. TeamScience.ai only
        updates membership after acceptance.
      </footer>
    </main>
  );
}
