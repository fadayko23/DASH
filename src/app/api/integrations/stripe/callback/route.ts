import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // We passed tenantId as state
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/dashboard/settings/integrations?error=" + error, req.url));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/dashboard/settings/integrations?error=missing_params", req.url));
  }

  const tenantId = state;

  try {
    const response = await stripe.oauth.token({
      grant_type: "authorization_code",
      code,
    });

    const { stripe_user_id, access_token, refresh_token, scope } = response;

    await prisma.tenantStripeConnection.upsert({
      where: { tenantId },
      update: {
        stripeUserId: stripe_user_id!,
        accessToken: access_token!,
        refreshToken: refresh_token,
        scope: scope,
      },
      create: {
        tenantId,
        stripeUserId: stripe_user_id!,
        accessToken: access_token!,
        refreshToken: refresh_token,
        scope: scope,
      },
    });

    return NextResponse.redirect(new URL("/dashboard/settings/integrations?success=stripe_connected", req.url));
  } catch (err) {
    console.error("Stripe OAuth error:", err);
    return NextResponse.redirect(new URL("/dashboard/settings/integrations?error=oauth_failed", req.url));
  }
}
