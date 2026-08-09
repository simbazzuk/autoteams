import { PageShell } from "@/components/Site";
import { CourseCatalogue } from "@/components/academy/CourseCatalogue";

export default function AcademyCoursesPage() {
  return (
    <PageShell>
      <div className="academy-readable">
      <CourseCatalogue />
          </div>
    </PageShell>
  );
}
