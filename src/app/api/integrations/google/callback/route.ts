import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state") // tenantId
  const error = searchParams.get("error")

  if (error) return NextResponse.json({ error })
  if (!code || !state) return NextResponse.json({ error: "Invalid request" }, { status: 400 })

  // In a real app, verify state against session/cookie to prevent CSRF.
  // Here 'state' is used to ensure we link to the correct tenant if session is lost, 
  // BUT we should primarily rely on the active session.
  const session = await auth()
  if (!session?.user?.tenantId || session.user.tenantId !== state) {
      return NextResponse.json({ error: "Unauthorized or session mismatch" }, { status: 401 })
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
          code,
          client_id: clientId!,
          client_secret: clientSecret!,
          redirect_uri: redirectUri!,
          grant_type: "authorization_code"
      })
  })

  const tokens = await tokenRes.json()
  if (tokens.error) return NextResponse.json({ error: tokens.error })

  // Get User Info (Email)
  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
  })
  const userData = await userRes.json()

  // Store Connection
  await prisma.tenantGoogleConnection.upsert({
      where: { tenantId: session.user.tenantId },
      create: {
          tenantId: session.user.tenantId,
          accountEmail: userData.email,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token, // Only returned on first consent or force prompt
          expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
          scopes: tokens.scope
      },
      update: {
          accountEmail: userData.email,
          accessToken: tokens.access_token,
          // Only update refresh token if provided
          ...(tokens.refresh_token ? { refreshToken: tokens.refresh_token } : {}),
          expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
          scopes: tokens.scope
      }
  })

  return NextResponse.redirect(new URL("/dashboard/settings/integrations", req.url))
}
