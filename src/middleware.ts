import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/webhooks") ||
    pathname.startsWith("/ref/") ||
    pathname.startsWith("/pago") ||
    pathname === "/favicon.ico"
  ) {
    return response
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cs) => cs.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        ),
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (pathname === "/login") {
    if (user && user.email === process.env.ADMIN_EMAIL) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    }
    if (user && user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.redirect(new URL("/aliado/dashboard", request.url))
    }
    return response
  }

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (pathname.startsWith("/admin") && user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.redirect(new URL("/aliado/dashboard", request.url))
  }

  return response
}

export const config = {
  matcher: ["/login", "/admin/:path*", "/aliado/:path*"],
}
