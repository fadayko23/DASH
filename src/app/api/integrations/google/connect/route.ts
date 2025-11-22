import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI

  if (!clientId || !redirectUri) {
      return NextResponse.json({ error: "Google OAuth not configured" }, { status: 500 })
  }

  const scopes = [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/calendar"
  ]

  // State should ideally be random + include tenantId for security/context
  const state = session.user.tenantId

  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes.join(" ")}&access_type=offline&prompt=consent&state=${state}`

  return NextResponse.redirect(url)
}
