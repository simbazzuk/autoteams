import { createHmac, timingSafeEqual } from "node:crypto";

export const ATLAS_AI_USAGE_COOKIE =
  "autoteams_atlas_ai_usage";

type StoredUsage = {
  period: string;
  used: number;
  lastUsedAt: number;
};

export type AtlasAiAllowance = {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
  period: string;
  reason?: "monthly_limit" | "cooldown";
  cookieValue?: string;
};

function envNumber(name: string, fallback: number) {
  const parsed = Number(process.env[name] ?? fallback);
  return Number.isFinite(parsed)
    ? Math.max(0, Math.floor(parsed))
    : fallback;
}

function secret() {
  return (
    process.env.AUTOTEAMS_USAGE_SECRET ||
    "autoteams-launch-usage-guard-change-me"
  );
}

function period(now: Date) {
  return `${now.getUTCFullYear()}-${String(
    now.getUTCMonth() + 1,
  ).padStart(2, "0")}`;
}

function signature(payload: string) {
  return createHmac("sha256", secret())
    .update(payload)
    .digest("base64url");
}

function encode(value: StoredUsage) {
  const payload = Buffer.from(
    JSON.stringify(value),
    "utf8",
  ).toString("base64url");

  return `${payload}.${signature(payload)}`;
}

function decode(value?: string): StoredUsage | null {
  if (!value) return null;

  const [payload, supplied] = value.split(".");
  if (!payload || !supplied) return null;

  const expected = signature(payload);

  try {
    const a = Buffer.from(supplied);
    const b = Buffer.from(expected);

    if (
      a.length !== b.length ||
      !timingSafeEqual(a, b)
    ) {
      return null;
    }

    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as Partial<StoredUsage>;

    if (
      typeof parsed.period !== "string" ||
      typeof parsed.used !== "number" ||
      typeof parsed.lastUsedAt !== "number"
    ) {
      return null;
    }

    return {
      period: parsed.period,
      used: Math.max(0, Math.floor(parsed.used)),
      lastUsedAt: parsed.lastUsedAt,
    };
  } catch {
    return null;
  }
}

export function readAtlasAiAllowance(
  existingCookie?: string,
  now = new Date(),
): {
  limit: number;
  used: number;
  remaining: number;
  period: string;
  resetLabel: string;
} {
  const limit = envNumber(
    "AUTOTEAMS_FREE_AI_RECOMMENDATIONS_PER_MONTH",
    10,
  );

  const currentPeriod = period(now);
  const decoded = decode(existingCookie);

  const used =
    decoded?.period === currentPeriod
      ? decoded.used
      : 0;

  const nextReset =
    new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth() + 1,
        1,
      ),
    );

  return {
    limit,
    used,
    remaining: Math.max(0, limit - used),
    period: currentPeriod,
    resetLabel:
      nextReset.toLocaleDateString(
        "en-GB",
        {
          day: "numeric",
          month: "long",
          timeZone: "UTC",
        },
      ),
  };
}
export function evaluateAtlasAiAllowance(
  existingCookie?: string,
  now = new Date(),
): AtlasAiAllowance {
  const limit = envNumber(
    "AUTOTEAMS_FREE_AI_RECOMMENDATIONS_PER_MONTH",
    10,
  );

  const cooldownMs =
    envNumber(
      "AUTOTEAMS_AI_RECOMMENDATION_COOLDOWN_SECONDS",
      20,
    ) * 1000;

  const currentPeriod = period(now);
  const decoded = decode(existingCookie);

  const current: StoredUsage =
    decoded?.period === currentPeriod
      ? decoded
      : {
          period: currentPeriod,
          used: 0,
          lastUsedAt: 0,
        };

  const common = {
    used: current.used,
    limit,
    remaining: Math.max(0, limit - current.used),
    period: currentPeriod,
  };

  if (
    cooldownMs > 0 &&
    current.lastUsedAt > 0 &&
    now.getTime() - current.lastUsedAt < cooldownMs
  ) {
    return {
      allowed: false,
      ...common,
      reason: "cooldown",
    };
  }

  if (current.used >= limit) {
    return {
      allowed: false,
      ...common,
      reason: "monthly_limit",
    };
  }

  const next: StoredUsage = {
    period: currentPeriod,
    used: current.used + 1,
    lastUsedAt: now.getTime(),
  };

  return {
    allowed: true,
    used: next.used,
    limit,
    remaining: Math.max(0, limit - next.used),
    period: currentPeriod,
    cookieValue: encode(next),
  };
}
