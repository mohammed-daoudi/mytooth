import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Define protected routes patterns
const protectedRoutes = ['/dashboard', '/admin'];
const adminOnlyRoutes = ['/admin'];
const publicRoutes = ['/', '/about', '/services', '/contact', '/auth/login', '/auth/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes and API routes
  if (publicRoutes.includes(pathname) || pathname.startsWith('/api/') || pathname.startsWith('/_next/')) {
    return NextResponse.next();
  }

  // Get token from cookies or Authorization header
  const token = request.cookies.get('auth-token')?.value ||
                request.headers.get('Authorization')?.replace('Bearer ', '');

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminOnlyRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    // No token provided
    if (!token) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verify the token
      const payload = verifyToken(token);

      if (!payload) {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Check admin-only routes
      if (isAdminRoute && payload.role !== 'admin' && payload.role !== 'dentist') {
        // Redirect non-admin users to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      // Add user info to request headers for downstream use
      const response = NextResponse.next();
      response.headers.set('x-user-id', payload.userId);
      response.headers.set('x-user-role', payload.role);
      response.headers.set('x-user-email', payload.email);

      return response;

    } catch (error) {
      console.error('Token verification failed:', error);

      // Clear invalid token and redirect to login
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.cookies.delete('auth-token');
      return response;
    }
  }

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
