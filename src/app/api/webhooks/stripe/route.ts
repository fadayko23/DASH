import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

// Initialize Stripe safely for build time
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy_build_key", {
  apiVersion: "2025-11-17.clover",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    if (!endpointSecret) throw new Error("Webhook secret not configured");
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentIntentSucceeded(paymentIntent);
      break;
    case "payment_intent.payment_failed":
      const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentIntentFailed(failedPaymentIntent);
      break;
    default:
      // Unexpected event type
      console.log(`Unhandled event type ${event.type}`);
  }

  return new NextResponse(null, { status: 200 });
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const { metadata } = paymentIntent;
  const tenantId = metadata.tenantId;
  const milestoneId = metadata.milestoneId;
  
  // Find the payment record by external ID or milestone if we have it stored
  // Since we might not store the PI ID immediately if it was created client-side in some flows (though here we do server-side),
  // we should rely on metadata.
  
  if (tenantId && milestoneId) {
    // Update or create payment record
    // In our flow, we create the record pending when generating the link.
    // So we look for a pending record for this milestone
    
    // Find pending record for this milestone/payment intent
    const record = await prisma.paymentRecord.findFirst({
      where: {
        externalPaymentId: paymentIntent.id,
      }
    });

    if (record) {
      await prisma.paymentRecord.update({
        where: { id: record.id },
        data: {
          status: "succeeded",
          updatedAt: new Date(),
        },
      });
    } else {
      // Fallback if record wasn't found (maybe direct charge?)
      await prisma.paymentRecord.create({
        data: {
          tenantId,
          projectId: metadata.projectId,
          milestoneId: metadata.milestoneId,
          externalPaymentId: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          status: "succeeded",
          provider: "stripe",
        }
      });
    }
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const record = await prisma.paymentRecord.findFirst({
      where: {
        externalPaymentId: paymentIntent.id,
      }
  });

  if (record) {
    await prisma.paymentRecord.update({
      where: { id: record.id },
      data: {
        status: "failed",
        updatedAt: new Date(),
      },
    });
  }
}
