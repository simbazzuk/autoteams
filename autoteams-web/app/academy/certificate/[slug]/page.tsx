import {
  notFound,
} from "next/navigation";
import { PageShell } from "@/components/Site";
import { CourseCertificate } from "@/components/academy/CourseCertificate";
import { getAcademyCourse } from "@/lib/academy/course-catalogue";

export default async function AcademyCertificatePage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const {
    slug,
  } = await params;

  const course =
    getAcademyCourse(
      slug,
    );

  if (!course) {
    notFound();
  }

  return (
    <PageShell>
      <div className="academy-readable">
      <CourseCertificate
        course={course}
      />
          </div>
    </PageShell>
  );
}
