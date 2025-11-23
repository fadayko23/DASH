import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

let stripeInstance: Stripe | undefined;

function getStripe() {
  if (!stripeInstance) {
    // Fallback for build time if env var is missing
    const key = process.env.STRIPE_SECRET_KEY || "sk_test_dummy_build_key";
    stripeInstance = new Stripe(key, {
      apiVersion: "2025-11-17.clover",
    });
  }
  return stripeInstance;
}

export async function getStripeConnection(tenantId: string) {
  return await prisma.tenantStripeConnection.findUnique({
    where: { tenantId },
  });
}

export async function createCustomerForClient(
  clientId: string,
  tenantId: string
) {
  const connection = await getStripeConnection(tenantId);
  if (!connection) {
    throw new Error("Tenant not connected to Stripe");
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: { billingCustomer: true },
  });

  if (!client) {
    throw new Error("Client not found");
  }

  if (client.billingCustomer) {
    return client.billingCustomer;
  }

  // Create customer on the connected account
  const customer = await getStripe().customers.create(
    {
      email: client.email || undefined,
      name: client.name,
      metadata: {
        clientId: client.id,
        tenantId: tenantId,
      },
    },
    {
      stripeAccount: connection.stripeUserId,
    }
  );

  return await prisma.billingCustomer.create({
    data: {
      tenantId,
      clientId,
      externalCustomerId: customer.id,
      provider: "stripe",
    },
  });
}

export async function createPaymentIntentForMilestone(
  milestoneId: string,
  tenantId: string
) {
  const connection = await getStripeConnection(tenantId);
  if (!connection) {
    throw new Error("Tenant not connected to Stripe");
  }

  const milestone = await prisma.projectMilestone.findUnique({
    where: { id: milestoneId },
    include: { project: true },
  });

  if (!milestone || !milestone.amount) {
    throw new Error("Milestone not found or has no amount");
  }

  // Ensure client has a customer record
  const billingCustomer = await createCustomerForClient(
    milestone.project.clientId,
    tenantId
  );

  const amountCents = Math.round(Number(milestone.amount) * 100);

  const paymentIntent = await getStripe().paymentIntents.create(
    {
      amount: amountCents,
      currency: "usd",
      customer: billingCustomer.externalCustomerId,
      metadata: {
        milestoneId: milestone.id,
        projectId: milestone.projectId,
        tenantId: tenantId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    },
    {
      stripeAccount: connection.stripeUserId,
    }
  );

  // Record pending payment
  await prisma.paymentRecord.create({
    data: {
      tenantId,
      projectId: milestone.projectId,
      milestoneId: milestone.id,
      externalPaymentId: paymentIntent.id,
      amount: milestone.amount,
      currency: "usd",
      status: "pending",
      provider: "stripe",
    },
  });

  return paymentIntent;
}

export async function getPaymentStatus(paymentIntentId: string, tenantId: string) {
  const connection = await getStripeConnection(tenantId);
  if (!connection) {
    throw new Error("Tenant not connected to Stripe");
  }

  return await getStripe().paymentIntents.retrieve(paymentIntentId, {
    stripeAccount: connection.stripeUserId,
  });
}
