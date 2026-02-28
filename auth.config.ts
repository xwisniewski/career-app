import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible auth config — no Prisma, no Node.js-only modules.
 * Used by middleware. The full config (auth.ts) adds the Prisma adapter and
 * credentials logic, and is only used in Server Components and API routes.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [], // populated in auth.ts
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
      const isOnboarding = pathname.startsWith("/onboarding");

      if (isAuthPage) {
        if (isLoggedIn) return Response.redirect(new URL("/dashboard", nextUrl));
        return true;
      }

      if (!isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      // Onboarding check is handled in the page itself (middleware can't query DB)
      // If onboarding is complete and user hits /onboarding, the page redirects to /dashboard
      void isOnboarding; // suppress unused var warning

      return true;
    },
  },
} satisfies NextAuthConfig;
