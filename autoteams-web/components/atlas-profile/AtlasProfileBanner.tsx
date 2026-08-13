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
            <strong>{onProfile ? "Your Atlas Profile" : "Improve My Atlas Profile"}</strong>
            <span>
              {onProfile
                ? "Keep your strengths, working style and team-fit signals up to date."
                : "Answer or update your Atlas interview questions so Atlas can better understand how you work, communicate and collaborate."}
            </span>
          </div>
        </div>

        {onProfile ? (
          <span className="atlas-profile-banner-current">Atlas interview</span>
        ) : (
          <Link className="atlas-profile-banner-action" href="/my-atlas-profile">
            Improve Profile <span aria-hidden="true">-&gt;</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
