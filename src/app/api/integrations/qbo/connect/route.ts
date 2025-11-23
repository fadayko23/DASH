import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

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

  const clientId = process.env.QBO_CLIENT_ID;
  const redirectUri = `${process.env.NEXTAUTH_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/integrations/qbo/callback`;
  const scope = "com.intuit.quickbooks.accounting";
  const state = tenantId;

  const qboAuthUrl = `https://appcenter.intuit.com/connect/oauth2?client_id=${clientId}&response_type=code&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

  return NextResponse.redirect(qboAuthUrl);
}
