"use client";

export function AtlasOrb({
  size = "md",
  state = "idle",
  label = "Atlas",
}: {
  size?: "sm" | "md" | "lg" | "xl";
  state?: "idle" | "thinking" | "complete";
  label?: string;
}) {
  return (
    <span
      aria-label={label}
      className={`atlas-orb atlas-orb-${size} atlas-orb-${state}`}
      role="img"
    >
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <radialGradient id="atlas-core" cx="35%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#d8d2ff" />
            <stop offset="28%" stopColor="#9c89ff" />
            <stop offset="62%" stopColor="#6959f4" />
            <stop offset="100%" stopColor="#318bff" />
          </radialGradient>

          <linearGradient id="atlas-ring" x1="10%" y1="10%" x2="90%" y2="90%">
            <stop offset="0%" stopColor="#b6a8ff" />
            <stop offset="50%" stopColor="#7565ff" />
            <stop offset="100%" stopColor="#45a4ff" />
          </linearGradient>

          <filter id="atlas-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="
                0.55 0 0 0 0.35
                0 0.4 0 0 0.25
                0 0 1 0 0.8
                0 0 0 0.9 0
              "
            />
          </filter>
        </defs>

        <circle
          className="atlas-orb-glow"
          cx="50"
          cy="50"
          r="31"
          fill="#765eff"
          filter="url(#atlas-glow)"
          opacity="0.75"
        />

        <circle
          className="atlas-orb-ring"
          cx="50"
          cy="50"
          r="39"
          fill="none"
          stroke="url(#atlas-ring)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="55 24 16 28"
        />

        <circle
          className="atlas-orb-core"
          cx="50"
          cy="50"
          r="28"
          fill="url(#atlas-core)"
        />

        <ellipse
          cx="40"
          cy="35"
          rx="11"
          ry="7"
          fill="rgba(255,255,255,.48)"
          transform="rotate(-25 40 35)"
        />

        <circle cx="50" cy="50" r="11" fill="rgba(255,255,255,.08)" />

        <path
          d="M50 34 L54 45 L66 50 L54 55 L50 67 L46 55 L34 50 L46 45 Z"
          fill="rgba(255,255,255,.88)"
        />

        <circle
          className="atlas-orb-spark"
          cx="79"
          cy="25"
          r="4"
          fill="#bfeeff"
        />
      </svg>
    </span>
  );
}
