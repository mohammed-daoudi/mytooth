import { NextRequest, NextResponse } from 'next/server';
import { verifyJWTForMiddlewareSync } from '@/lib/middleware-auth';

// Helper function to get redirect URL based on user role
function getRedirectUrlForRole(role: string, baseUrl: string): string {
  console.log('🔄 [MIDDLEWARE] Getting redirect URL for role:', role);
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'DENTIST':
      return '/dentist/dashboard';
    case 'USER':
    default:
      return '/dashboard';
  }
}

// Define protected routes patterns
const protectedRoutes = ['/dashboard', '/admin', '/booking', '/profile', '/appointments'];
const adminOnlyRoutes = ['/admin'];
const dentistRoutes = ['/admin', '/dashboard/dentist'];
const patientRoutes = ['/dashboard/patient', '/appointments', '/profile'];
const publicRoutes = ['/', '/about', '/services', '/contact', '/reviews', '/auth/login', '/auth/register', '/login-test'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log('🛡️ [MIDDLEWARE] Processing request for:', pathname);

  // Allow public routes and API routes
  if (publicRoutes.includes(pathname) || pathname.startsWith('/api/') || pathname.startsWith('/_next/')) {
    console.log('✅ [MIDDLEWARE] Public route, allowing access:', pathname);
    return NextResponse.next();
  }

  // Get token from cookies, Authorization header, or check if it should be passed through
  const token = request.cookies.get('auth-token')?.value ||
                request.headers.get('Authorization')?.replace('Bearer ', '');

  console.log('🔍 [MIDDLEWARE] Token found:', !!token);
  console.log('🔍 [MIDDLEWARE] Token length:', token?.length || 0);

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminOnlyRoutes.some(route => pathname.startsWith(route));

  console.log('🔍 [MIDDLEWARE] Route analysis:', {
    pathname,
    isProtectedRoute,
    isAdminRoute,
    hasToken: !!token
  });

  if (isProtectedRoute) {
    // No token provided
    if (!token) {
      console.log('❌ [MIDDLEWARE] No token provided for protected route');
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      console.log('🔄 [MIDDLEWARE] Redirecting to:', loginUrl.toString());
      return NextResponse.redirect(loginUrl);
    }

    try {
      console.log('🔐 [MIDDLEWARE] Verifying token...');
      // Use synchronous version since middleware can't be async
      // Note: In production, consider using a more robust solution
      const payload = verifyJWTForMiddlewareSync(token);

      console.log('🔍 [MIDDLEWARE] Token verification result:', {
        success: !!payload,
        userId: payload?.userId,
        email: payload?.email,
        role: payload?.role
      });

      if (!payload) {
        console.log('❌ [MIDDLEWARE] Token verification failed');
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }

      console.log('✅ [MIDDLEWARE] User authenticated:', {
        userId: payload.userId,
        email: payload.email,
        role: payload.role
      });

      // Check admin-only routes
      if (isAdminRoute && payload.role !== 'ADMIN' && payload.role !== 'DENTIST') {
        console.log('❌ [MIDDLEWARE] Insufficient permissions for admin route');
        // Redirect based on user role
        const redirectUrl = new URL(getRedirectUrlForRole(payload.role, request.url), request.url);
        redirectUrl.searchParams.set('error', 'insufficient-permissions');
        return NextResponse.redirect(redirectUrl);
      }

      // Check dentist-specific routes
      const isDentistRoute = dentistRoutes.some(route => pathname.startsWith(route));
      if (isDentistRoute && payload.role !== 'ADMIN' && payload.role !== 'DENTIST') {
        console.log('❌ [MIDDLEWARE] Insufficient permissions for dentist route');
        const redirectUrl = new URL(getRedirectUrlForRole(payload.role, request.url), request.url);
        redirectUrl.searchParams.set('error', 'dentist-access-required');
        return NextResponse.redirect(redirectUrl);
      }

      // Add user info to request headers for downstream use
      const response = NextResponse.next();
      response.headers.set('x-user-id', payload.userId);
      response.headers.set('x-user-role', payload.role);
      response.headers.set('x-user-email', payload.email);

      console.log('✅ [MIDDLEWARE] Access granted, continuing to page');
      return response;

    } catch (error) {
      console.error('🚨 [MIDDLEWARE] Token verification failed:', error);

      // Clear invalid token and redirect to login
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.cookies.delete('auth-token');
      return response;
    }
  }

  console.log('✅ [MIDDLEWARE] Non-protected route, allowing access');
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
