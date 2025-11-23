import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const realmId = searchParams.get("realmId");
  const state = searchParams.get("state"); // tenantId
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/dashboard/settings/integrations?error=" + error, req.url));
  }

  if (!code || !realmId || !state) {
    return NextResponse.redirect(new URL("/dashboard/settings/integrations?error=missing_params", req.url));
  }

  const tenantId = state;
  const clientId = process.env.QBO_CLIENT_ID;
  const clientSecret = process.env.QBO_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXTAUTH_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/integrations/qbo/callback`;

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
        const errText = await tokenResponse.text();
        console.error("QBO Token Error:", errText);
        throw new Error("Failed to exchange token");
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;
    
    // Calculate expiry
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    await prisma.tenantAccountingConfig.upsert({
      where: { tenantId },
      update: {
        provider: "quickbooks",
        realmId,
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt,
      },
      create: {
        tenantId,
        provider: "quickbooks",
        realmId,
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt,
      },
    });

    return NextResponse.redirect(new URL("/dashboard/settings/integrations?success=qbo_connected", req.url));
  } catch (err) {
    console.error("QBO OAuth error:", err);
    return NextResponse.redirect(new URL("/dashboard/settings/integrations?error=oauth_failed", req.url));
  }
}
