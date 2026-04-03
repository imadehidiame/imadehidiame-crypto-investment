import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.SESSION_SECRET!);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;

  // Public routes (pre-auth marketing pages)
  const publicPaths = ['/', '/about', '/contact', '/about', '/plans', '/testimonials', '/auth', '/auth/signup' , '/faq','/get-started'];
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname === path || 
    request.nextUrl.pathname.startsWith(path + '/')
  );

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');

  // If trying to access auth page while already logged in → redirect to dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Protected routes — require authentication
  if (!token) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    //console.log({payload});
    const userRole = (payload as any).role || 'user';
    const stage = (payload as any).stage as number;

    // Admin-only routes (example)
    console.log('Pathname');
    console.log(request.nextUrl.pathname);
    const isAdminRoute = request.nextUrl.pathname.startsWith('/adm') || 
                        request.nextUrl.pathname.startsWith('/dashboard/adm');

    const userRoutes = ['/dashboard','/dashboard/profile','/kyc','/dashboard/subscribe',
      '/dashboard/transactions','/dashboard/investments','/dashboard/deposits',
      '/dashboard/settings','/dashboard/withdrawal','/dashboard/messages'
    ];
    console.log({isAdminRoute,userRole});
    if (isAdminRoute && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url)); // or /dashboard
    }
    const test1 = userRole === 'admin' && userRoutes.some(path => (request.nextUrl.pathname === path || request.nextUrl.pathname === path+'/') && path.startsWith
      ('/adm/'));
      console.log({test1});
    if(test1){
            return NextResponse.redirect(new URL('/adm/dashboard/', request.url)); // or /dashboard
    }
    if(userRole === 'user' && stage === 1 && request.nextUrl.pathname !== '/kyc'){
      return NextResponse.redirect(new URL('/kyc', request.url)); // or /dashboard
    }

    // Regular protected routes (e.g. /dashboard, /profile, etc.) — both user & admin allowed
    return NextResponse.next();

  } catch (error) {
    // Invalid or expired token
    const response = NextResponse.redirect(new URL('/auth', request.url));
    response.cookies.delete('auth-token');
    return response;
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};