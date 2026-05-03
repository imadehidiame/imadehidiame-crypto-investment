import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.SESSION_SECRET!);

const isPublicRoute = (routes:string[],request:NextRequest):boolean=>{
  return routes.some(path => 
    request.nextUrl.pathname === path || 
    request.nextUrl.pathname.startsWith(path + '/')
  );
}

const refreshCall = async (request:NextRequest):Promise<{access:string,refresh:string}|false> =>{
  try {
    //const allHeaders = Object.fromEntries(request.headers);
    //console.log({allHeaders});
    const response = await fetch(`${request.nextUrl.origin}/api/auth/refresh?middle=check`,{
      method:'POST',
      headers:{
        'X-REF-ID':request.cookies.get('refresh_token')?.value || '',
        ...Object.fromEntries(request.headers)
      }
    });
    //console.log(response);
    if(!response.ok)return false;
    const served = await response.json() as {access:string,refresh:string};
    //console.log({served});
    return served;
  } catch (error) {
    console.log(error);
    //return false;
  }
  return false;
}

export async function middleware(request: NextRequest) {
  const pathnamee = request.nextUrl.pathname;
  if (
    pathnamee.startsWith('/_next') ||
    pathnamee.startsWith('/api') ||
    pathnamee.startsWith('/img') ||
    pathnamee.startsWith('/icons') || 
    pathnamee.endsWith('.png') ||
    pathnamee.endsWith('.jpg') ||
    pathnamee.endsWith('.jpeg') ||
    pathnamee.endsWith('.gif') 
   ) {
    return NextResponse.next();
   }
   //console.log(request.nextUrl);
  //let token = request.cookies.get('auth-token')?.value;
  let token = request.cookies.get('access_token')?.value;
  const refresh = request.cookies.get('refresh_token')?.value;
  //console.log('Tokens value');
  //console.log({token});
  //console.log({refresh});
  //console.log('Url value == '+request.nextUrl.pathname);

  // Public routes (pre-auth marketing pages)
  const publicPaths = ['/', '/about', '/contact', '/about', '/plans', '/testimonials', '/auth', '/auth/signup' , '/faq','/get-started'];
  const isPublicPath = isPublicRoute(publicPaths,request);
  const isSubscriptionUrl = request.nextUrl.pathname.includes('/dashboard/subscribe') && request.nextUrl.searchParams.get('plan');
  /*publicPaths.some(path => 
    request.nextUrl.pathname === path || 
    request.nextUrl.pathname.startsWith(path + '/')
  );*/

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
   let refreshData:{access:string,refresh:string}|false = false;
   let isTokenChange = false;
  if(!token){
    if(refresh){
      refreshData = await refreshCall(request);
      if(refreshData){
        token = refreshData.access;
        isTokenChange = true;
      }
    }
  }

  // If trying to access auth page while already logged in → redirect to dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isPublicPath) {
    const response = NextResponse.next();
    if(refreshData){
      response.cookies.set('access_token',refreshData.access,{
        path:'/',
        httpOnly: true,
        maxAge:60*60*24*7,
        secure:process.env.NODE_ENV === 'production',
        sameSite:'strict'
      });
      if(refreshData.refresh && refreshData.refresh.length > 1)
      response.cookies.set('refresh_token',refreshData.refresh,{
        path:'/',
        httpOnly: true,
        maxAge:60*60*24*14,
        secure:process.env.NODE_ENV === 'production',
        sameSite:'strict'
      });
    }
    return response;
  }

  // Protected routes — require authentication
  if (!token) {
    //if(re)
    if(!refreshData){
    const response = NextResponse.redirect(new URL('/auth', request.url));
    if(isSubscriptionUrl){
      response.cookies.set('subscription_url',request.nextUrl.href,{
        httpOnly:true,
        secure:process.env.NODE_ENV === 'production',
        maxAge:60*60,
        path:'/',
        sameSite:'strict'
      });
    }
    return response;
    //return NextResponse.redirect(new URL('/auth', request.url));
    }
  }
  
  try {
    
    const { payload } = await jwtVerify(token! , JWT_SECRET);
    //console.log({payload});
    const userRole = (payload as any).role || 'user';
    const stage = (payload as any).stage as number;

    // Admin-only routes (example)
    
    
    const isAdminRoute = request.nextUrl.pathname.startsWith('/adm') || 
                        request.nextUrl.pathname.startsWith('/dashboard/adm');

    const userRoutes = ['/dashboard','/dashboard/profile','/kyc','/dashboard/subscribe',
      '/dashboard/transactions','/dashboard/investments','/dashboard/deposits',
      '/dashboard/settings','/dashboard/withdrawal','/dashboard/messages'
    ];
    //console.log({isAdminRoute});
    //console.log({userRole});
    const routeUrl = request.cookies.get('subscription_url')?.value;// || '/dashboard';
    const isRouteSubscription = !!request.cookies.get('subscription_url')?.value;
    const shouldRouteToSubscription = isRouteSubscription && !isSubscriptionUrl && stage !== 1;
    if (isAdminRoute && userRole !== 'admin') {
      return NextResponse.redirect(new URL( shouldRouteToSubscription ? routeUrl as string : '/dashboard', request.url)); 
    }
    const shouldRouteToAdmin = userRole === 'admin' && userRoutes.some(
      path => 
      (request.nextUrl.pathname === path || request.nextUrl.pathname === path+'/') && 
      !path.startsWith('/adm/')
    );
      
    if(shouldRouteToAdmin){
      return NextResponse.redirect(new URL('/adm/dashboard/', request.url)); 
    }
    if(userRole === 'user' && stage === 1 && request.nextUrl.pathname !== '/kyc'){
      return NextResponse.redirect(new URL('/kyc', request.url)); // or /dashboard
    }

    const response = NextResponse.next();
    if(isTokenChange){
      if(refreshData){
      response.cookies.set('access_token',refreshData.access,{
        path:'/',
        httpOnly: true,
        maxAge:60*60*24*7,
        secure:process.env.NODE_ENV === 'production',
        sameSite:'strict'
      });
      if(refreshData.refresh && refreshData.refresh.length > 1)
      response.cookies.set('refresh_token',refreshData.refresh,{
        path:'/',
        httpOnly: true,
        maxAge:60*60*24*14,
        secure:process.env.NODE_ENV === 'production',
        sameSite:'strict'
      });
     }
    }
    if(shouldRouteToSubscription){
      return NextResponse.redirect(new URL(routeUrl!, request.url));
    }
    if(isRouteSubscription){
      response.cookies.delete('subscription_url');
      return response;
    }
    // Regular protected routes (e.g. /dashboard, /profile, etc.) — both user & admin allowed
    return response;

  } catch (error) {
    // Invalid or expired token
    const response = NextResponse.redirect(new URL('/auth', request.url));
    //const response = NextResponse.json({error:'Invalid token'},{status:401});
    //response.cookies.delete('auth-token');
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    return response;
  }
}

/*export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};*/

export const config = {
  matcher: [
  '/((?!api|_next/static|_next/image|favicon.ico|img|fonts|robots.txt|sitemap.xml).*)',
  ],
 };