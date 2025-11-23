import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });
  
  const { id } = await params;

  const body = await req.json();
  const { name, subject, htmlBody } = body;

  const template = await prisma.emailTemplate.update({
    where: { id },
    data: {
      name,
      subject,
      htmlBody
    }
  });

  return NextResponse.json(template);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  
  await prisma.emailTemplate.delete({
    where: { id }
  });

  return new NextResponse(null, { status: 204 });
}
