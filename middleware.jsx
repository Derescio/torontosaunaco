// import { NextResponse } from 'next/server';
// import { getToken } from "next-auth/jwt";

// Re-export the default middleware from next-auth
// export { default } from 'next-auth/middleware';

// export async function middleware(request) {
//     const token = await getToken({ req: request });
//     const { pathname } = request.nextUrl;

    // If user is signed in and trying to access the sign-in page, redirect to home
    // if (token && pathname === '/signin') {
    //     return NextResponse.redirect(new URL('/', request.url));
    // }

    // If user is not signed in and trying to access protected routes, redirect to sign-in
   // const isProtectedRoute = ['/saunas/add', '/products/edit', '/profile', '/messages', '/orders', '/products/saved'].some(route => pathname.startsWith(route));
    // if (!token && isProtectedRoute) {
    //     const signInUrl = new URL('/signin', request.url);
    //     signInUrl.searchParams.set('callbackUrl', request.url);
    //     return NextResponse.redirect(signInUrl);
    // }


    // export async function middleware(request) {
    //     const token = await getToken({ req: request });
    //     const { pathname } = request.nextUrl;
    
    //     if (token && pathname === '/signin') {
    //         return NextResponse.redirect(new URL('/', request.url));
    //     }
    
    //     if (!token && pathname !== '/' && !pathname.startsWith('/signin')) {
    //         const signInUrl = new URL('/signin', request.url);
    //         signInUrl.searchParams.set('callbackUrl', request.url);
    //         return NextResponse.redirect(signInUrl);
    //     }
    
    // Allow the request to proceed
//     return NextResponse.next();
// }

// export const config = {
//     matcher: [
//         '/saunas/add',
//         '/products/edit',
//         '/profile',
//         '/messages',
//         '/orders',
//         '/products/saved',
//         '/signin'
//     ],
// };



// import { NextResponse } from 'next/server';
// import { getToken } from "next-auth/jwt";

// export { default } from 'next-auth/middleware';

// export async function middleware(request) {
//     const token = await getToken({ req: request });
//     const { pathname } = request.nextUrl;

//     if (token && pathname === '/signin') {
//         return NextResponse.redirect(new URL('/', request.url));
//     }

//     if (!token && pathname !== '/' && !pathname.startsWith('/signin')) {
//         const signInUrl = new URL('/signin', request.url);
//         signInUrl.searchParams.set('callbackUrl', request.url);
//         return NextResponse.redirect(signInUrl);
//     }

//     return NextResponse.next();
// }

// export const config = {
//     matcher: [
//         '/saunas/add',
//         '/products/edit',
//         '/profile',
//         '/messages',
//         '/orders',
//         '/products/saved',
//         '/signin'
//     ],
// };


// import { NextResponse } from 'next/server';
// import { getToken } from "next-auth/jwt";

// // Re-export the default middleware from next-auth
// export { default } from 'next-auth/middleware';

// export async function middleware(request) {
//     const token = await getToken({ req: request });
//     const { pathname } = request.nextUrl;

//     // If user is signed in and trying to access the sign-in page, redirect to home
//     if (token && pathname === '/signin') {
//         return NextResponse.redirect(new URL('/', request.url));
//     }

//     // If user is not signed in and trying to access protected routes, redirect to sign-in
//     const isProtectedRoute = ['/saunas/add', '/products/edit', '/profile', '/messages', '/orders', '/products/saved'].some(route => pathname.startsWith(route));
//     if (!token && isProtectedRoute) {
//         const signInUrl = new URL('/signin', request.url);
//         signInUrl.searchParams.set('callbackUrl', request.url);
//         return NextResponse.redirect(signInUrl);
//     }

//     // Allow the request to proceed
//     return NextResponse.next();
// }

// export const config = {
//     matcher: [
//         '/saunas/add',
//         '/products/edit',
//         '/profile',
//         '/messages',
//         '/orders',
//         '/products/saved',
//         '/signin'
//     ],
// };



import { NextResponse } from 'next/server';
import { getToken } from "next-auth/jwt";

export async function middleware(request) {
    const hasAuthCookie = request.cookies
        .getAll()
        .some(({ name }) => name.includes("next-auth.session-token"));
    const token = hasAuthCookie
        ? await getToken({ req: request })
        : null;
    const { pathname } = request.nextUrl;

    if (token && pathname === '/signin') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    if (!token && pathname === '/checkout') {
        const url = request.nextUrl.clone();
        url.pathname = '/precheckout';
        url.search = '';
        return NextResponse.redirect(url);
    }

    if (!token && pathname !== '/' && !pathname.startsWith('/signin')) {
        const signInUrl = new URL('/signin', request.url);
        signInUrl.searchParams.set('callbackUrl', request.url);
        return NextResponse.redirect(signInUrl);
    }

    if (token) {
        const role = token.role || (token.isAdmin ? "admin" : "user");

        if (pathname.startsWith("/admin") && role !== "admin") {
            return NextResponse.redirect(new URL("/", request.url));
        }

        if (pathname.startsWith("/editor") && !["admin", "editor"].includes(role)) {
            return NextResponse.redirect(new URL("/", request.url));
        }

        if (pathname.startsWith("/marketing") && !["admin", "marketing"].includes(role)) {
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/saunas/add',
        '/editor/:path*',
        '/admin/:path*',
        '/marketing/:path*',
        '/products/edit',
        '/profile',
        '/messages',
        '/orders',
        '/products/saved',
        '/signin',
        '/checkout',
    ],
};
