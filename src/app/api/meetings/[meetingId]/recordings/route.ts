import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

// Ensure uploads dir exists
const UPLOAD_DIR = path.join(process.cwd(), "public/uploads/recordings");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

  const { meetingId } = await params;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new NextResponse("No file uploaded", { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    await writeFile(filepath, buffer);

    // In a real app, upload to S3 and get URL
    const storageUrl = `/uploads/recordings/${filename}`;

    const recording = await prisma.meetingRecording.create({
      data: {
        meetingId,
        storageUrl,
        transcript: "Transcript processing pending..." // Placeholder
      }
    });

    return NextResponse.json(recording);
  } catch (error) {
    console.error("Upload error:", error);
    return new NextResponse("Upload failed", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

  const { meetingId } = await params;

  const recordings = await prisma.meetingRecording.findMany({
    where: { meetingId },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(recordings);
}
