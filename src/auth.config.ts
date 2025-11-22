import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnClientPortal = nextUrl.pathname.startsWith('/client');

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }

      if (isOnClientPortal) {
          if (isLoggedIn) return true;
          return false;
      }

      return true;
    },
    // Role-based redirection could also be handled here or in middleware more strictly
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig
