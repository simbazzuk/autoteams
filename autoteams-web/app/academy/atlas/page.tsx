import { PageShell } from "@/components/Site";
import { AcademyPathPage } from "@/components/academy/AcademyPathPage";

export default function Page() {
  return (
    <PageShell>
      <AcademyPathPage slug="atlas" />
    </PageShell>
  );
}
