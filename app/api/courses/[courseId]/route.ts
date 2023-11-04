import Mux from "@mux/mux-node";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { utapi } from "../../uploadthing/core";
import { isTeacher } from "@/lib/teacher";

const { Video } = new Mux(
  process.env.MUX_TOKEN_ID!,
  process.env.MUX_TOKEN_SECRET!
);

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId || !isTeacher(userId)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId: userId,
      },
      include: {
        chapters: {
          include: {
            muxData: true,
          },
        },
        attachments: {
          where: {
            courseId: params.courseId,
          },
        },
      },
    });
    if (!course) {
      return new NextResponse("Not found", { status: 404 });
    }

    for (const chapter of course.chapters) {
      if (chapter.muxData?.assetId) {
        await Video.Assets.del(chapter.muxData.assetId);
        const idVideo = chapter.videoUrl?.split("https://utfs.io/f/")[1];
        if (idVideo) {
          await utapi.deleteFiles(idVideo);
        }
      }
    }
    if (course.imageUrl) {
      const imageUrl = course.imageUrl?.split("https://utfs.io/f/")[1];
      if (imageUrl) {
        await utapi.deleteFiles(imageUrl);
      }
    }

    if (course.attachments.length) {
      const list = course.attachments.map((v) => v.name);
      await utapi.deleteFiles(list);
    }

    const deleteCourse = await db.course.delete({
      where: {
        id: params.courseId,
      },
    });

    return NextResponse.json(deleteCourse);
  } catch (error) {
    console.log("[COURSE_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();
    const { courseId } = params;
    const values = await req.json();
    if (!userId || !isTeacher(userId)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const course = await db.course.update({
      where: {
        id: courseId,
        userId,
      },
      data: {
        ...values,
      },
    });
    return NextResponse.json(course);
  } catch (error) {
    console.log("[COURSE_ID]", error);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
