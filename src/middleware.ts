import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith("/api/webhooks") ||
    pathname.startsWith("/ref/") ||
    pathname.startsWith("/pago")
  ) {
    return response
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cs) => cs.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (pathname.startsWith("/login")) {
    if (user) {
      if (user.email === process.env.ADMIN_EMAIL) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url))
      }
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

  if (pathname.startsWith("/aliado") && user.email === process.env.ADMIN_EMAIL) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url))
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)"],
}
