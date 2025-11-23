import { NextResponse } from "next/server";
import { signIn } from "@/auth"; 

export async function POST() {
  if (process.env.DEMO_MODE_ENABLED !== "true") {
    return new NextResponse("Demo mode disabled", { status: 403 });
  }

  // We can't directly call signIn from an API route easily if using NextAuth v5 beta mostly for server components/actions
  // But we can return credentials for the client to use, OR use a server action if this was a form.
  // Actually, since we are in an API route, let's return the demo user credentials
  // so the client can submit them to the standard login flow invisibly.
  
  // The demo user is 'alice@wonderland.com' / 'demo123'
  return NextResponse.json({
      email: 'alice@wonderland.com',
      password: 'demo123'
  });
}
