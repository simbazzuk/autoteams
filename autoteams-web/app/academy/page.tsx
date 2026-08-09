import { PageShell } from "@/components/Site";
import { CourseCatalogue } from "@/components/academy/CourseCatalogue";

export default function AcademyPage() {
  return (
    <PageShell>
      <div className="academy-readable">
      <CourseCatalogue />
          </div>
    </PageShell>
  );
}
