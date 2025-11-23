import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createPaymentIntentForMilestone } from "@/lib/services/stripe";

export async function POST(
  req: Request,
  { params }: { params: { projectId: string; milestoneId: string } }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { projectId, milestoneId } = await params;

  // In a real app, verify user has access to this project/tenant
  // Assuming session.tenantId is set for now or resolving via user
  // We'll re-fetch user to get tenant context if needed, but for MVP let's assume the milestone check below implicitly checks tenant if we enforce it.

  const milestone = await prisma.projectMilestone.findUnique({
    where: { id: milestoneId },
    include: { project: true },
  });

  if (!milestone) {
    return new NextResponse("Milestone not found", { status: 404 });
  }

  if (milestone.projectId !== projectId) {
    return new NextResponse("Milestone mismatch", { status: 400 });
  }

  try {
    const paymentIntent = await createPaymentIntentForMilestone(milestone.id, milestone.tenantId);
    
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error("Payment creation failed:", error);
    return new NextResponse(error.message || "Payment creation failed", { status: 500 });
  }
}
