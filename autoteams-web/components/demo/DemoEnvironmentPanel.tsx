"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  DemoDatasetId,
  applyDemoDataset,
  clearDemoDataset,
  demoDatasets,
  loadActiveDemoDataset,
} from "@/lib/demo-environment";

export function DemoEnvironmentPanel() {
  const [selected, setSelected] = useState<DemoDatasetId>("business");
  const [active, setActive] = useState<DemoDatasetId>("empty");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const current = loadActiveDemoDataset();
    setActive(current);
    if (current !== "empty") setSelected(current);
  }, []);

  function loadDataset() {
    applyDemoDataset(selected);
    setActive(selected);
    const definition = demoDatasets.find((item) => item.id === selected);
    setMessage(`${definition?.name || "Demo"} data loaded. Refreshing pages will now use the new dataset.`);
  }

  function reset() {
    const confirmed = window.confirm(
      "Remove demo data and return to the normal local first-use state?",
    );
    if (!confirmed) return;
    clearDemoDataset();
    setActive("empty");
    setMessage("Demo data removed.");
  }

  return (
    <main className="demo135-page">
      <section className="demo135-hero">
        <div className="container demo135-hero-grid">
          <div>
            <span className="eyebrow">Demo Environment</span>
            <h1>Test complete journeys with realistic data.</h1>
            <p>
              Load a Business, Friendship, Community or Sports scenario without
              writing to Firebase or creating real users.
            </p>
          </div>

          <aside>
            <small>Current dataset</small>
            <strong>
              {demoDatasets.find((item) => item.id === active)?.name}
            </strong>
            <span>{active === "empty" ? "No demo data loaded" : "Demo mode active"}</span>
          </aside>
        </div>
      </section>

      <section className="demo135-body">
        <div className="container">
          <div className="demo135-warning">
            <span>!</span>
            <div>
              <strong>Local browser data</strong>
              <p>
                Loading a dataset replaces the AutoTeams prototype data in this
                browser only. It does not change Firebase or your GitHub repository.
              </p>
            </div>
          </div>

          <div className="demo135-grid">
            {demoDatasets
              .filter((item) => item.id !== "empty")
              .map((dataset) => (
                <label
                  className={selected === dataset.id ? "selected" : ""}
                  key={dataset.id}
                >
                  <input
                    type="radio"
                    name="demo-dataset"
                    checked={selected === dataset.id}
                    onChange={() => setSelected(dataset.id)}
                  />
                  <span>{datasetIcon(dataset.id)}</span>
                  <div>
                    <h2>{dataset.name}</h2>
                    <p>{dataset.description}</p>
                    <div className="demo135-stats">
                      <em>{dataset.people} people</em>
                      <em>{dataset.profiles} profiles</em>
                      <em>{dataset.teams} teams</em>
                    </div>
                  </div>
                </label>
              ))}
          </div>

          <div className="demo135-actions">
            <button className="button" onClick={loadDataset} type="button">
              Load Selected Dataset
            </button>
            <button className="button secondary" onClick={reset} type="button">
              Reset Demo Data
            </button>
          </div>

          {message && <div className="demo135-success">{message}</div>}

          <section className="demo135-test-section">
            <div>
              <span className="eyebrow">Recommended test sequence</span>
              <h2>Walk through the complete product.</h2>
            </div>

            <div className="demo135-journey">
              {[
                ["/profile/membership", "01", "Membership", "Review roles and invitations"],
                ["/talent", "02", "Talent", "Review people and Team DNA states"],
                ["/talent-pools", "03", "Talent Pools", "Review eligible populations"],
                ["/team-dna", "04", "Team DNA", "Review complete, incomplete and stale profiles"],
                ["/team-builder", "05", "Build with Atlas", "Test the team-building flow"],
                ["/notifications", "06", "Notifications", "Test unread items and preferences"],
              ].map(([href, number, title, text]) => (
                <Link href={href} key={href}>
                  <span>{number}</span>
                  <div>
                    <strong>{title}</strong>
                    <small>{text}</small>
                  </div>
                  <em>→</em>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function datasetIcon(dataset: DemoDatasetId): string {
  return {
    empty: "○",
    business: "⌂",
    friendship: "♡",
    community: "♙",
    sports: "◎",
  }[dataset];
}
