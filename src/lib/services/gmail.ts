import { prisma } from "@/lib/prisma";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function getGoogleConnection(tenantId: string) {
  return await prisma.tenantGoogleConnection.findUnique({
    where: { tenantId },
  });
}

export async function sendTenantEmailViaGmail(tenantId: string, { to, subject, html }: EmailOptions) {
  const connection = await getGoogleConnection(tenantId);

  if (!connection) {
    console.log("No Google connection found for tenant, falling back to log/mock.");
    // Fallback to console or generic provider if implemented
    console.log(`[Mock Email] To: ${to}, Subject: ${subject}`);
    return;
  }

  // Refresh token if needed (simplified, assuming token is valid or we'd have a refresh flow here)
  // In a real app, we check expiresAt and use refresh_token to get new access_token
  // For MVP, we use accessToken directly.

  const rawMessage = [
    `To: ${to}`,
    "Content-Type: text/html; charset=utf-8",
    "MIME-Version: 1.0",
    `Subject: ${subject}`,
    "",
    html,
  ].join("\n");

  const encodedMessage = Buffer.from(rawMessage)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${connection.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      raw: encodedMessage,
    }),
  });

  if (!res.ok) {
      const err = await res.text();
      console.error("Gmail API Error:", err);
      throw new Error(`Gmail send failed: ${res.statusText}`);
  }

  return await res.json();
}
