import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Routes accessible only to guests (non-authenticated users)
const GUEST_ONLY_ROUTES = ["/login", "/forgot-password", "/reset-password"];

// Route prefixes and their required roles
const ROLE_ROUTES: { prefix: string; roles: string[] }[] = [
  { prefix: "/admin", roles: ["ADMIN"] },
  { prefix: "/teacher", roles: ["TEACHER"] },
  { prefix: "/parent", roles: ["PARENT"] },
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Unauthenticated user trying to access a protected page → redirect to login
  if (!user) {
    const isProtected = ROLE_ROUTES.some((r) => pathname.startsWith(r.prefix));
    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // Authenticated user on guest-only pages → redirect to their dashboard
  if (GUEST_ONLY_ROUTES.some((r) => pathname.startsWith(r))) {
    // Fetch role from database
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    const url = request.nextUrl.clone();
    switch (profile?.role) {
      case "ADMIN":
        url.pathname = "/admin";
        break;
      case "TEACHER":
        url.pathname = "/teacher";
        break;
      default:
        url.pathname = "/parent";
    }
    return NextResponse.redirect(url);
  }

  // Authenticated user trying to access a role they don't have → 403 or redirect
  const matchedRoute = ROLE_ROUTES.find((r) =>
    pathname.startsWith(r.prefix)
  );
  if (matchedRoute) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!matchedRoute.roles.includes(profile?.role ?? "")) {
      const url = request.nextUrl.clone();
      switch (profile?.role) {
        case "ADMIN":
          url.pathname = "/admin";
          break;
        case "TEACHER":
          url.pathname = "/teacher";
          break;
        default:
          url.pathname = "/parent";
      }
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
