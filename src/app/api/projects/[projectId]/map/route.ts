import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      contactLinks: {
        include: { contactOrganization: true }
      },
      products: {
        include: {
          product: {
            include: {
              vendor: {
                include: {
                  locations: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!project) return new NextResponse("Project not found", { status: 404 });

  // Collect map markers
  const markers = [];

  // 1. Project Address
  if (project.projectAddress && project.projectLat && project.projectLng) {
    markers.push({
      id: 'project-location',
      type: 'project',
      name: project.name,
      address: project.projectAddress,
      lat: project.projectLat,
      lng: project.projectLng
    });
  }

  // 2. Contact Organizations (Architects, Contractors, etc.)
  project.contactLinks.forEach(link => {
    const contact = link.contactOrganization;
    if (contact.lat && contact.lng) {
      markers.push({
        id: contact.id,
        type: contact.type, // 'architect', 'contractor', etc.
        name: contact.name,
        address: contact.address,
        lat: contact.lat,
        lng: contact.lng
      });
    }
  });

  // 3. Vendor Showrooms/Locations
  // Deduplicate vendors
  const processedVendors = new Set<string>();
  project.products.forEach(pp => {
    const vendor = pp.product.vendor;
    if (vendor && !processedVendors.has(vendor.id)) {
      processedVendors.add(vendor.id);
      vendor.locations.forEach(loc => {
        if (loc.lat && loc.lng) {
          markers.push({
            id: loc.id,
            type: 'vendor',
            name: loc.name || vendor.name,
            address: loc.address,
            lat: loc.lat,
            lng: loc.lng,
            vendorName: vendor.name
          });
        }
      });
    }
  });

  return NextResponse.json({ markers });
}
