import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

  // Get tenant
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });
  const tenantId = user?.tenants[0]?.tenantId;
  if (!tenantId) return new NextResponse("Tenant not found", { status: 404 });

  // Fetch vendor reps
  const reps = await prisma.tenantVendorRep.findMany({
    where: { tenantId },
    include: { vendor: true }
  });

  return NextResponse.json(reps);
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
  const { vendorId, repName, repEmail, repPhone, notes } = body;

  const rep = await prisma.tenantVendorRep.create({
    data: {
      tenantId,
      vendorId,
      repName,
      repEmail,
      repPhone,
      notes
    }
  });

  return NextResponse.json(rep);
}
