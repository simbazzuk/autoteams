import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";
import { PageShell } from "@/components/Site";

export default function SignUpPage() {
  return (
    <PageShell>
      <section className="auth-page">
        <div className="container">
          <Suspense fallback={<div className="card">Loading registration…</div>}>
            <AuthForm mode="signup" />
          </Suspense>
        </div>
      </section>
    </PageShell>
  );
}
