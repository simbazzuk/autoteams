"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductIcon } from "@/components/ui/ProductIcon";
import styles from "./GeminiLiveStatus.module.css";

type HealthResponse = {
  connected: boolean;
  provider: string;
  project?: string;
  location?: string;
  model?: string;
  responseTimeMs?: number;
  response?: string;
  usage?: {
    promptTokens?: number;
    responseTokens?: number;
    totalTokens?: number;
  };
  checkedAt?: string;
  error?: string;
};

export function GeminiLiveStatus() {
  const [result, setResult] =
    useState<HealthResponse | null>(null);
  const [checking, setChecking] = useState(false);

  async function checkConnection() {
    setChecking(true);

    try {
      const response = await fetch("/api/ai/health", {
        method: "POST",
      });

      const body =
        (await response.json()) as HealthResponse;

      setResult(body);
    } catch (error) {
      setResult({
        connected: false,
        provider: "google-vertex-ai",
        error:
          error instanceof Error
            ? error.message
            : "Unable to test Gemini.",
      });
    } finally {
      setChecking(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div>
            <span className="eyebrow">
              Gemini Live Status
            </span>
            <h1>
              Verify AutoTeams is really connected to Gemini.
            </h1>
            <p>
              This performs a live server-side request to
              Google Vertex AI. A successful result proves
              the application can authenticate and call the
              configured Gemini model.
            </p>
          </div>

          <aside className={styles.statusCard}>
            <ProductIcon
              label="Gemini status"
              size="lg"
            >
              ✦
            </ProductIcon>

            <div>
              <small>Connection status</small>
              <strong>
                {!result
                  ? "Not checked"
                  : result.connected
                    ? "Connected"
                    : "Unavailable"}
              </strong>
              <p>
                {!result
                  ? "Run the live test below."
                  : result.connected
                    ? "Vertex AI responded successfully."
                    : result.error ||
                      "Vertex AI did not respond successfully."}
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.body}>
        <div className="container">
          <section className={styles.testPanel}>
            <div>
              <span className="eyebrow">
                Live connectivity test
              </span>
              <h2>
                Call Gemini from the AutoTeams backend.
              </h2>
              <p>
                The test sends a tiny request through the
                same server-side Google Gen AI client used
                by team recommendations.
              </p>
            </div>

            <button
              className="button"
              disabled={checking}
              onClick={checkConnection}
              type="button"
            >
              {checking
                ? "Testing Gemini…"
                : "Test Live Gemini Connection"}
            </button>
          </section>

          {result && (
            <section
              className={`${styles.result} ${
                result.connected
                  ? styles.connected
                  : styles.failed
              }`}
            >
              <header>
                <ProductIcon
                  label={
                    result.connected
                      ? "Connected"
                      : "Unavailable"
                  }
                  size="md"
                >
                  {result.connected ? "✓" : "△"}
                </ProductIcon>

                <div>
                  <span className="eyebrow">
                    {result.connected
                      ? "Live AI connection confirmed"
                      : "Gemini connection failed"}
                  </span>
                  <h2>
                    {result.connected
                      ? "AutoTeams is connected to Gemini."
                      : "AutoTeams could not reach Gemini."}
                  </h2>
                </div>
              </header>

              <div className={styles.metrics}>
                <Metric
                  label="Provider"
                  value="Google Vertex AI"
                />
                <Metric
                  label="Model"
                  value={result.model || "Unknown"}
                />
                <Metric
                  label="Location"
                  value={result.location || "Unknown"}
                />
                <Metric
                  label="Response time"
                  value={
                    typeof result.responseTimeMs ===
                    "number"
                      ? `${result.responseTimeMs} ms`
                      : "—"
                  }
                />
                <Metric
                  label="Prompt tokens"
                  value={
                    numberOrDash(
                      result.usage?.promptTokens,
                    )
                  }
                />
                <Metric
                  label="Response tokens"
                  value={
                    numberOrDash(
                      result.usage?.responseTokens,
                    )
                  }
                />
                <Metric
                  label="Total tokens"
                  value={
                    numberOrDash(
                      result.usage?.totalTokens,
                    )
                  }
                />
                <Metric
                  label="Checked"
                  value={
                    result.checkedAt
                      ? formatDateTime(
                          result.checkedAt,
                        )
                      : "—"
                  }
                />
              </div>

              {result.connected && (
                <div className={styles.proof}>
                  <small>Gemini response</small>
                  <strong>
                    {result.response || "CONNECTED"}
                  </strong>
                </div>
              )}

              {!result.connected &&
                result.error && (
                  <div className={styles.errorBox}>
                    <small>Error</small>
                    <code>{result.error}</code>
                  </div>
                )}
            </section>
          )}

          <section className={styles.explain}>
            <div className={styles.heading}>
              <span className="eyebrow">
                What the statuses mean
              </span>
              <h2>
                Live Gemini and fallback are clearly separated.
              </h2>
            </div>

            <div className={styles.explainGrid}>
              <article>
                <span className={styles.liveDot} />
                <div>
                  <strong>
                    Live Gemini Recommendation
                  </strong>
                  <p>
                    Vertex AI returned the recommendation.
                    The API response has
                    <code> source: "gemini" </code>.
                  </p>
                </div>
              </article>

              <article>
                <span className={styles.fallbackDot} />
                <div>
                  <strong>
                    Deterministic Fallback
                  </strong>
                  <p>
                    Gemini failed or was unavailable. The
                    API response has
                    <code> source: "fallback" </code>.
                  </p>
                </div>
              </article>
            </div>
          </section>

          <section className={styles.actions}>
            <Link
              className="button secondary"
              href="/team-builder"
            >
              Test a Team Recommendation
            </Link>

            <Link
              className="button secondary"
              href="/gemini-team-coach"
            >
              Gemini Team Coach
            </Link>
          </section>
        </div>
      </section>
    </main>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <article>
      <small>{label}</small>
      <strong>{value}</strong>
    </article>
  );
}

function numberOrDash(
  value?: number,
): string {
  return typeof value === "number"
    ? String(value)
    : "—";
}

function formatDateTime(
  value: string,
): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}
