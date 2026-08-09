import {
  notFound,
} from "next/navigation";
import { PageShell } from "@/components/Site";
import { CourseExperience } from "@/components/academy/CourseExperience";
import { getAcademyCourse } from "@/lib/academy/course-catalogue";

export default async function AcademyCoursePage({
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
      <CourseExperience
        course={course}
      />
          </div>
    </PageShell>
  );
}
