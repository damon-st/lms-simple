import { getDashboardCourses } from "@/actions/get-dashborad-crouse";
import { CoursesList } from "@/components/courses-list";
import { auth } from "@clerk/nextjs";
import { CheckCircle, Clock } from "lucide-react";
import { redirect } from "next/navigation";
import { InfoCard } from "./_components/info-card";

export default async function Dashboard() {
  const { userId } = auth();
  if (!userId) {
    return redirect("/");
  }

  const { completedCourses, coursesInProses } = await getDashboardCourses(
    userId
  );
  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoCard
          icon={Clock}
          label="In Progress"
          numberOfItems={coursesInProses.length}
        />
        <InfoCard
          icon={CheckCircle}
          label="Completed"
          variant="success"
          numberOfItems={completedCourses.length}
        />
      </div>
      <CoursesList items={[...coursesInProses, ...completedCourses]} />
    </div>
  );
}
