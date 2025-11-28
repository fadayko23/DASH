import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentTenant } from "@/lib/tenant";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

  const tenant = await getCurrentTenant();
  if (!tenant) return new NextResponse("Tenant not found", { status: 404 });

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const where: any = {
    tenantId: tenant.id,
  };

  if (projectId) {
    where.projectId = projectId;
  }

  if (startDate || endDate) {
    where.startDateTime = {};
    if (startDate) {
      where.startDateTime.gte = new Date(startDate);
    }
    if (endDate) {
      where.startDateTime.lte = new Date(endDate);
    }
  }

  const meetings = await prisma.meeting.findMany({
    where,
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
      client: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      recordings: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { startDateTime: "desc" },
  });

  return NextResponse.json(meetings);
}

