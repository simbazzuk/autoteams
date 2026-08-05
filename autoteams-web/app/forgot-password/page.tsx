import { PasswordResetForm } from "@/components/PasswordResetForm";
import { PageShell } from "@/components/Site";

export default function ForgotPasswordPage() {
  return (
    <PageShell>
      <section className="auth-page">
        <div className="container">
          <PasswordResetForm />
        </div>
      </section>
    </PageShell>
  );
}
