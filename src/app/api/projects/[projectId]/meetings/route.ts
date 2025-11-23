import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

  const { projectId } = await params;

  const meetings = await prisma.meeting.findMany({
    where: { projectId },
    orderBy: { startDateTime: "desc" }
  });

  return NextResponse.json(meetings);
}
