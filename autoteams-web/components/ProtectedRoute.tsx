"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useAuth } from "./AuthProvider";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?next=/dashboard");
    }
  }, [loading, router, user]);

  if (loading || !user) {
    return (
      <div className="container auth-loading">
        <div className="card">Checking your TeamScience.ai account…</div>
      </div>
    );
  }

  return <>{children}</>;
}
