import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

  // Helper to resolve tenant (reused logic)
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });
  const tenantId = user?.tenants[0]?.tenantId;

  if (!tenantId) return new NextResponse("Tenant not found", { status: 404 });

  const templates = await prisma.emailTemplate.findMany({
    where: { tenantId },
    orderBy: { updatedAt: 'desc' }
  });

  return NextResponse.json(templates);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });
  const tenantId = user?.tenants[0]?.tenantId;
  if (!tenantId) return new NextResponse("Tenant not found", { status: 404 });

  const body = await req.json();
  const { key, name, subject, htmlBody } = body;

  const template = await prisma.emailTemplate.create({
    data: {
      tenantId,
      key,
      name,
      subject,
      htmlBody
    }
  });

  return NextResponse.json(template);
}
