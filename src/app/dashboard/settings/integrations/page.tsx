import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Suspense } from "react";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

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
  if (!tenantId) return <div>Tenant not found</div>;

  const googleConnection = await prisma.tenantGoogleConnection.findUnique({
    where: { tenantId },
  });

  const stripeConnection = await prisma.tenantStripeConnection.findUnique({
    where: { tenantId },
  });

  const qboConnection = await prisma.tenantAccountingConfig.findUnique({
    where: { tenantId },
  });

  const params = await searchParams;
  const error = params?.error;
  const success = params?.success;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Success: </strong>
          <span className="block sm:inline">Integration connected successfully!</span>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Google Workspace Integration */}
        <div className="border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Google Workspace</h2>
            {googleConnection ? (
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Connected</span>
            ) : (
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Not Connected</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Connect your Google Workspace to sync calendars and schedule meetings.
          </p>
          {googleConnection ? (
             <div className="text-sm text-gray-600">
               <p>Connected account: <strong>{googleConnection.accountEmail}</strong></p>
               <p className="text-xs text-muted-foreground mt-1">Expires: {googleConnection.expiresAt.toLocaleDateString()}</p>
             </div>
          ) : (
            <a
              href="/api/integrations/google/connect"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Connect Google Workspace
            </a>
          )}
        </div>

        {/* Stripe Integration */}
        <div className="border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Stripe</h2>
            {stripeConnection ? (
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Connected</span>
            ) : (
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Not Connected</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Connect your Stripe account to accept payments for milestones.
          </p>
          {stripeConnection ? (
             <div className="text-sm text-gray-600">
               <p>Stripe Account ID: <strong>{stripeConnection.stripeUserId}</strong></p>
             </div>
          ) : (
            <a
              href="/api/integrations/stripe/connect"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#635bff] text-white hover:bg-[#635bff]/90 h-10 px-4 py-2"
            >
              Connect Stripe
            </a>
          )}
        </div>

        {/* QuickBooks Online Integration */}
        <div className="border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">QuickBooks Online</h2>
            {qboConnection ? (
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Connected</span>
            ) : (
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Not Connected</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Connect QuickBooks Online to sync clients, estimates, and invoices.
          </p>
          {qboConnection ? (
             <div className="text-sm text-gray-600">
               <p>Realm ID: <strong>{qboConnection.realmId}</strong></p>
             </div>
          ) : (
            <a
              href="/api/integrations/qbo/connect"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#2CA01C] text-white hover:bg-[#2CA01C]/90 h-10 px-4 py-2"
            >
              Connect QuickBooks
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
