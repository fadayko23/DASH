import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendTenantEmailViaGmail } from "@/lib/services/gmail";
import { renderEmailTemplate } from "@/lib/email/renderer";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });
  const tenantId = user?.tenants[0]?.tenantId;
  if (!tenantId) return new NextResponse("Tenant not found", { status: 404 });

  const body = await req.json();
  const { templateKey, toEmail, data, projectId } = body;

  const template = await prisma.emailTemplate.findUnique({
    where: {
        tenantId_key: {
            tenantId,
            key: templateKey
        }
    }
  });

  if (!template) {
      return new NextResponse("Template not found", { status: 404 });
  }

  const renderedHtml = renderEmailTemplate(template.htmlBody, data);
  const renderedSubject = renderEmailTemplate(template.subject, data);

  try {
      await sendTenantEmailViaGmail(tenantId, {
          to: toEmail,
          subject: renderedSubject,
          html: renderedHtml
      });

      // Optional: Log to project messages
      if (projectId) {
          // Ideally find client ID from toEmail or project
          // Skipping for MVP to keep it simple
      }

      return NextResponse.json({ success: true });
  } catch (error: any) {
      console.error("Send email error:", error);
      return new NextResponse(error.message || "Failed to send email", { status: 500 });
  }
}
