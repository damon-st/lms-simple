import { db } from "@/lib/db";
import { Category, Chapter, Course } from "@prisma/client";
import { getProgress } from "./get-progress";

type CourseWithProgressWithCategory = Course & {
  category: Category;
  chapters: Chapter[];
  progress: number | null;
};

type DashboardCourses = {
  completedCourses: CourseWithProgressWithCategory[];
  coursesInProses: CourseWithProgressWithCategory[];
};
export const getDashboardCourses = async (
  userId: string
): Promise<DashboardCourses> => {
  try {
    const purchaedCourses = await db.purchase.findMany({
      where: {
        userId,
      },
      select: {
        course: {
          include: {
            category: true,
            chapters: {
              where: {
                isPublished: true,
              },
            },
          },
        },
      },
    });
    const courses = purchaedCourses.map(
      (purchase) => purchase.course
    ) as CourseWithProgressWithCategory[];
    for (const course of courses) {
      const progress = await getProgress(userId, course.id);
      course["progress"] = progress;
    }
    const completedCourses = courses.filter((course) => course.progress == 100);
    const coursesInProses = courses.filter(
      (course) => (course.progress ?? 0) < 100
    );

    return {
      completedCourses,
      coursesInProses,
    };
  } catch (error) {
    console.log("[GET_DASHBOARD_COURSES]", error);
    return {
      completedCourses: [],
      coursesInProses: [],
    };
  }
};
