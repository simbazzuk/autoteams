"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AtlasProfileBanner() {
  const pathname = usePathname();
  const onProfile =
    pathname === "/my-atlas-profile" ||
    pathname.startsWith("/my-atlas-profile/");

  return (
    <aside className={`atlas-profile-banner${onProfile ? " is-current" : ""}`} aria-label="Atlas Profile">
      <div className="container atlas-profile-banner-inner">
        <div className="atlas-profile-banner-copy">
          <span className="atlas-profile-banner-icon" aria-hidden="true">A</span>
          <div>
            <strong>{onProfile ? "Your Atlas Profile" : "Tune your Atlas Profile"}</strong>
            <span>
              {onProfile
                ? "Keep your strengths, working style and team-fit signals up to date."
                : "Improve the signals Atlas uses to understand your strengths, working style and team fit."}
            </span>
          </div>
        </div>

        {onProfile ? (
          <span className="atlas-profile-banner-current">Profile tuning</span>
        ) : (
          <Link className="atlas-profile-banner-action" href="/my-atlas-profile">
            Tune Profile <span aria-hidden="true">-&gt;</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
