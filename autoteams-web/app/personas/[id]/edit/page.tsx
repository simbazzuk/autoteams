import { PageHero, PageShell } from "@/components/Site";
import { PersonaEditor } from "@/components/PersonaEditor";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function EditPersonaPage() {
  return (
    <PageShell>
      <ProtectedRoute>
        <PageHero
          eyebrow="Team Persona"
          title="Update your matching profile."
          text="Keep your goals, availability and matching signals accurate."
        />
        <section className="section tight">
          <div className="container">
            <PersonaEditor />
          </div>
        </section>
      </ProtectedRoute>
    </PageShell>
  );
}
