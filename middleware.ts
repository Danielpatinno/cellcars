import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({
              name,
              value,
              ...options,
            });
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: any) {
            request.cookies.set({
              name,
              value: "",
              ...options,
            });
            response.cookies.set({
              name,
              value: "",
              ...options,
            });
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Rotas que não precisam de autenticação
    const publicRoutes = ["/login", "/auth/callback", "/vehicles/upload", "/api/vehicles/upload-temp"];
    const isPublicRoute = publicRoutes.some((route) =>
      request.nextUrl.pathname.startsWith(route)
    );

    // Se não está autenticado e tentando acessar rota protegida
    if (!user && !isPublicRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Se está autenticado e tentando acessar login, redirecionar para home
    if (user && request.nextUrl.pathname === "/login") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return response;
  } catch (error) {
    // Se houver erro, permitir acesso à página de login
    if (request.nextUrl.pathname === "/login") {
      return response;
    }
    // Para outras rotas, redirecionar para login em caso de erro
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

