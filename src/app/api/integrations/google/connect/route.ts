import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Need tenant context
  // For MVP assuming first tenant or from session if we had it
  // We'll use session.user.tenantId if we can, otherwise this route needs auth fix
  // But wait, in auth.ts we added tenants to session?
  // Let's rely on tenantId passed in state, but we need to generate state.
  // For now, let's just use "default" state or fetch from DB if needed.
  
  // Refetching user to get tenantId securely
  const { prisma } = await import("@/lib/prisma");
  const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { tenants: true }
  });
  
  const tenantId = user?.tenants[0]?.tenantId;

  if (!tenantId) {
    return NextResponse.json({ error: "No tenant found" }, { status: 404 })
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI

  if (!clientId || !redirectUri) {
      return NextResponse.json({ error: "Google OAuth not configured" }, { status: 500 })
  }

  const scopes = [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/gmail.send"
  ]

  // State should ideally be random + include tenantId for security/context
  const state = tenantId

  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes.join(" ")}&access_type=offline&prompt=consent&state=${state}`

  return NextResponse.redirect(url)
}
