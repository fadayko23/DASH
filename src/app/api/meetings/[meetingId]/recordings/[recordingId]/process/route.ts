import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { processMeetingRecording } from "@/lib/services/ai-meeting";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ meetingId: string; recordingId: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

  const { recordingId } = await params;

  try {
    await processMeetingRecording(recordingId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return new NextResponse(error.message || "Processing failed", { status: 500 });
  }
}
