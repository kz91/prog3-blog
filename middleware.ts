import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // Check for custom session cookie
    const sessionCookie = request.cookies.get('user_session')
    let user = null

    if (sessionCookie) {
        try {
            user = JSON.parse(sessionCookie.value)
        } catch (e) {
            // Invalid cookie
        }
    }

    // Protect routes
    // /posts/create, /edit are protected for any authenticated user
    if (
        request.nextUrl.pathname.startsWith('/posts/create') ||
        request.nextUrl.pathname.endsWith('/edit')
    ) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // Protect /admin routes
    // if (request.nextUrl.pathname.startsWith('/admin')) {
    //     if (!user) {
    //         return NextResponse.redirect(new URL('/login', request.url))
    //     }
    //     // Check for admin email
    //     // if (user.email !== 'kznyan91@gmail.com') {
    //     //     return NextResponse.redirect(new URL('/', request.url))
    //     // }
    // }

    // Redirect logged in users away from login/signup
    if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') && user) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
