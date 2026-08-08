import {notFound} from "next/navigation";
import {CourseExperience} from "@/components/academy/CourseExperience";
import {getAcademyCourse} from "@/lib/academy/course-catalogue";
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const course=getAcademyCourse(slug);if(!course)notFound();return <CourseExperience course={course}/>}
