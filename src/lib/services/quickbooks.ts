import { prisma } from "@/lib/prisma";

// Types for QBO API responses/requests (partial)
interface QBOCustomer {
  Id?: string;
  GivenName: string;
  FamilyName: string;
  PrimaryEmailAddr?: { Address: string };
  PrimaryPhone?: { FreeFormNumber: string };
  BillAddr?: { Line1: string; City?: string; CountrySubDivisionCode?: string; PostalCode?: string };
}

interface QBOEstimate {
  Line: any[];
  CustomerRef: { value: string };
}

interface QBOInvoice {
  Line: any[];
  CustomerRef: { value: string };
}

async function getQBOConfig(tenantId: string) {
  const config = await prisma.tenantAccountingConfig.findUnique({
    where: { tenantId },
  });

  if (!config || !config.accessToken || !config.realmId) {
    throw new Error("Tenant not connected to QuickBooks Online");
  }
  
  // Token refresh logic would go here in production
  // For MVP we assume valid or manual re-auth if expired
  return config;
}

const BASE_URL = "https://sandbox-quickbooks.api.intuit.com"; // Use sandbox for dev, switch based on env

async function qboRequest(url: string, method: string, accessToken: string, body?: any) {
  const res = await fetch(url, {
    method,
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!res.ok) {
      const text = await res.text();
      console.error("QBO API Error:", text);
      throw new Error(`QBO API request failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function syncClientToQBO(clientId: string, tenantId: string) {
  const config = await getQBOConfig(tenantId);
  const client = await prisma.client.findUnique({ where: { id: clientId } });

  if (!client) throw new Error("Client not found");

  // Check if already synced? We don't store QBO ID in Client yet, but maybe we should?
  // For now, we'll search by display name (Name)
  const searchUrl = `${BASE_URL}/v3/company/${config.realmId}/query?query=select * from Customer where DisplayName = '${client.name.replace(/'/g, "\\'")}'&minorversion=65`;
  const searchRes = await qboRequest(searchUrl, 'GET', config.accessToken);

  let qboCustomerId;

  if (searchRes.QueryResponse?.Customer?.length > 0) {
      qboCustomerId = searchRes.QueryResponse.Customer[0].Id;
      // Update logic if needed
  } else {
      // Create new
      const [givenName, ...familyParts] = client.name.split(" ");
      const familyName = familyParts.join(" ") || "Client";

      const newCustomer: QBOCustomer = {
          GivenName: givenName,
          FamilyName: familyName,
          PrimaryEmailAddr: client.email ? { Address: client.email } : undefined,
          PrimaryPhone: client.phone ? { FreeFormNumber: client.phone } : undefined,
          BillAddr: client.primaryAddress ? { Line1: client.primaryAddress } : undefined
      };

      const createRes = await qboRequest(`${BASE_URL}/v3/company/${config.realmId}/customer?minorversion=65`, 'POST', config.accessToken, newCustomer);
      qboCustomerId = createRes.Customer.Id;
  }

  return qboCustomerId;
}

export async function createEstimateFromContract(contractId: string, tenantId: string) {
    const config = await getQBOConfig(tenantId);
    const contract = await prisma.contract.findUnique({
        where: { id: contractId },
        include: { project: true }
    });

    if (!contract) throw new Error("Contract not found");

    const customerId = await syncClientToQBO(contract.project.clientId, tenantId);

    // Simple estimate with one line for base amount
    const amount = Number(contract.baseFlatAmount || 0) + Number(contract.baseHoursAllocated || 0) * 150; // Mock rate calculation if hourly

    const estimateBody: QBOEstimate = {
        CustomerRef: { value: customerId },
        Line: [
            {
                Description: `Contract: ${contract.title}`,
                Amount: amount,
                DetailType: "SalesItemLineDetail",
                SalesItemLineDetail: {
                    Qty: 1,
                    UnitPrice: amount
                }
            }
        ]
    };

    const res = await qboRequest(`${BASE_URL}/v3/company/${config.realmId}/estimate?minorversion=65`, 'POST', config.accessToken, estimateBody);
    return res.Estimate;
}

export async function createInvoiceFromMilestone(milestoneId: string, tenantId: string) {
    const config = await getQBOConfig(tenantId);
    const milestone = await prisma.projectMilestone.findUnique({
        where: { id: milestoneId },
        include: { project: true }
    });

    if (!milestone || !milestone.amount) throw new Error("Milestone not found or invalid amount");

    const customerId = await syncClientToQBO(milestone.project.clientId, tenantId);

    const invoiceBody: QBOInvoice = {
        CustomerRef: { value: customerId },
        Line: [
            {
                Description: `Milestone: ${milestone.name}`,
                Amount: Number(milestone.amount),
                DetailType: "SalesItemLineDetail",
                SalesItemLineDetail: {
                    Qty: 1,
                    UnitPrice: Number(milestone.amount)
                }
            }
        ]
    };

    const res = await qboRequest(`${BASE_URL}/v3/company/${config.realmId}/invoice?minorversion=65`, 'POST', config.accessToken, invoiceBody);
    return res.Invoice;
}
