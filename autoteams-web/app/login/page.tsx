import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";
import { PageShell } from "@/components/Site";

export default function LoginPage() {
  return (
    <PageShell>
      <section className="auth-page">
        <div className="container">
          <Suspense fallback={<div className="card">Loading login…</div>}>
            <AuthForm mode="login" />
          </Suspense>
        </div>
      </section>
    </PageShell>
  );
}
