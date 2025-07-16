// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from 'next/server';

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  async function middleware(req) {
    const token = req.nextauth.token;

    const { pathname } = req.nextUrl;

    // 1. Redirect if not authenticated (handled by withAuth, but explicit for clarity)
    // If the token doesn't exist, it means the user is not authenticated.
    // `withAuth` automatically redirects to `pages.signIn` if no token for protected routes.
    // We add explicit redirects for certain patterns to ensure consistent behavior.
    if (!token) {
      if (
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/onboarding') ||
        pathname.startsWith('/pending-approval') ||
        pathname.startsWith('/admin') ||
        pathname.startsWith('/api/complete-profile') ||
        pathname.startsWith('/api/admin')
      ) {
        // Redirects to /login (or the signIn page configured in authOptions)
        return NextResponse.redirect(new URL('/login', req.url));
      }
      return NextResponse.next(); // Allow access to public pages like /login, /register, /
    }

    // --- User is authenticated (token exists) ---

    const isProfileComplete = token.isProfileComplete;
    const isApproved = token.isApproved;
    const userEmail = token.email; // For admin check

    // 2. Profile Completion Check
    // If user is authenticated but profile is not complete, redirect to onboarding,
    // unless they are already on the onboarding page or related API route.
    if (!isProfileComplete && pathname !== '/onboarding' && !pathname.startsWith('/api/complete-profile')) {
      console.log(`Middleware: User ${userEmail} - Profile incomplete. Redirecting to /onboarding from ${pathname}`);
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }

    // 3. Admin Approval Check
    // If profile is complete but not approved, redirect to pending-approval,
    // unless they are already on the pending-approval page.
    if (isProfileComplete && !isApproved && pathname !== '/pending-approval') {
      // Allow access to complete-profile API even if not approved, in case they need to resubmit
      // However, after completing profile, they will be redirected to pending-approval.
      if (pathname.startsWith('/api/complete-profile')) {
          return NextResponse.next();
      }
      console.log(`Middleware: User ${userEmail} - Profile complete but NOT approved. Redirecting to /pending-approval from ${pathname}`);
      return NextResponse.redirect(new URL('/pending-approval', req.url));
    }

    // 4. Admin Routes Protection
    // Example: Only allow 'admin@example.com' to access '/admin' routes and '/api/admin' routes
    const isAdmin = userEmail === process.env.ADMIN_EMAIL || userEmail === 'admin@example.com'; // Use an environment variable for ADMIN_EMAIL

    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
        if (!isAdmin) {
            console.log(`Middleware: User ${userEmail} - Unauthorized attempt to access admin route: ${pathname}`);
            return NextResponse.redirect(new URL('/dashboard', req.url)); // Redirect to dashboard or a 403 page
        }
    }

    // If all checks pass, allow access
    console.log(`Middleware: User ${userEmail} - Access granted for ${pathname}`);
    return NextResponse.next();
  },
  {
    // These paths are explicitly public and won't trigger the middleware's authentication checks initially.
    // They are then handled by the middleware function if a token is present, for example, to redirect
    // authenticated users from /login to /dashboard.
    callbacks: {
      authorized: ({ token }) => {
        // If there is a token, the user is authorized for basic access.
        // Further route-specific authorization happens inside the middleware function.
        return !!token;
      },
    },
    pages: {
      signIn: '/login', // Specify your login page
    },
  }
);

// Define which paths the middleware should run on.
export const config = {
  matcher: [
    '/dashboard/:path*', // All dashboard routes
    '/onboarding',       // Onboarding page
    '/pending-approval', // Pending approval page
    '/api/complete-profile', // API for profile completion
    '/api/admin/:path*', // All admin API routes
    '/admin/:path*',     // All admin UI routes
    // Optionally, if you want to redirect logged-in users from login/register:
    // '/login',
    // '/register',
    // Uncommenting '/login' and '/register' here means the middleware will run
    // for these pages and can redirect authenticated users away.
  ],
};