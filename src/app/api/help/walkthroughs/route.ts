import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const walkthroughs = await prisma.helpWalkthrough.findMany({
    orderBy: { title: "asc" },
  });

  return NextResponse.json(walkthroughs);
}
