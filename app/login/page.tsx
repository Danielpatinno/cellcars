"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, User, Lock, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      const email = username.includes("@") ? username : `${username}@cellcars.local`;

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("Usuario o contraseña incorrectos");
        return;
      }

      if (data.user) {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Error inesperado al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-zinc-100 via-white to-zinc-100 flex flex-col items-center justify-center p-6 sm:p-8">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.12),transparent)]"
        aria-hidden
      />

      <div className="relative w-full max-w-[420px]">
        <div className="rounded-2xl border border-zinc-200/80 bg-white/90 p-8 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.12)] backdrop-blur-sm sm:p-10">
          <header className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
              <Image
                src="/assets/imagens/loco_cell.png"
                alt=""
                width={52}
                height={52}
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">CelleCars</h1>
            <p className="mt-2 text-sm text-zinc-500">Inicie sesión para acceder al panel</p>
          </header>

          <form onSubmit={handleLogin} className="space-y-5">
            {error ? (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                {error}
              </div>
            ) : null}

            <div className="space-y-2">
              <label htmlFor="login-username" className="block text-sm font-medium text-zinc-800">
                Usuario
              </label>
              <div className="relative">
                <User
                  className="pointer-events-none absolute left-3 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-zinc-400"
                  aria-hidden
                />
                <Input
                  id="login-username"
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-11 border-zinc-300 pl-10 pr-3 text-base shadow-sm focus-visible:border-zinc-900"
                  placeholder="Ingrese su usuario"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="login-password" className="block text-sm font-medium text-zinc-800">
                Contraseña
              </label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-zinc-400"
                  aria-hidden
                />
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    "h-11 border-zinc-300 pl-10 pr-11 text-base shadow-sm focus-visible:border-zinc-900",
                    showPassword && "font-mono tracking-wide",
                  )}
                  placeholder="••••••••"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 size-9 -translate-y-1/2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOff className="size-[1.125rem]" aria-hidden />
                  ) : (
                    <Eye className="size-[1.125rem]" aria-hidden />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="mt-2 h-11 w-full bg-blue-600 text-base font-semibold text-white shadow-md hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Iniciando sesión…
                </>
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
