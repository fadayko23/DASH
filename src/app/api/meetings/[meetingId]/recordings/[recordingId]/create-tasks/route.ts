import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ meetingId: string; recordingId: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

  const { meetingId, recordingId } = await params;

  const recording = await prisma.meetingRecording.findUnique({
    where: { id: recordingId },
    include: { meeting: true }
  });

  if (!recording || !recording.actionItemsJson) {
    return new NextResponse("No recording or action items found", { status: 400 });
  }

  const actionItems = recording.actionItemsJson as any[];
  const createdTasks = [];

  // Need tenant context for task creation
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { tenants: true } });
  const tenantId = user?.tenants[0]?.tenantId;
  if (!tenantId) return new NextResponse("Tenant not found", { status: 404 });

  for (const item of actionItems) {
      const task = await prisma.task.create({
          data: {
              tenantId,
              projectId: recording.meeting.projectId,
              title: item.title,
              description: `From meeting recording: ${recording.meeting.title}\nAssignee: ${item.assignee || 'Unassigned'}\nDue: ${item.dueDate || 'None'}`,
              status: 'todo',
              // Optional: try to parse dueDate if valid date string
          }
      });
      createdTasks.push(task);
  }

  return NextResponse.json({ createdCount: createdTasks.length });
}
