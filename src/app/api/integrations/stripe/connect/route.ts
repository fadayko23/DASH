import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // In a real app, you'd use the tenant from the session or a header
  // For now, we'll fetch the user's first tenant
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      tenants: {
        take: 1,
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const tenantId = user?.tenants[0]?.tenantId;
  if (!tenantId) {
    return new NextResponse("Tenant not found", { status: 404 });
  }

  const clientId = process.env.STRIPE_CLIENT_ID;
  const redirectUri = `${process.env.NEXTAUTH_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/integrations/stripe/callback`;
  
  // Using 'state' to pass tenantId securely is recommended
  const state = tenantId;

  const stripeConnectUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${clientId}&scope=read_write&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

  return NextResponse.redirect(stripeConnectUrl);
}
