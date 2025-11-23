"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../app/contexts/SidebarContext";
import { Button } from "@/components/ui/button";
import { Home, Car, Users, AlertTriangle, ChevronRight, LucideIcon, DollarSign, LogOut, Key } from "lucide-react";
import { useAuth } from "../app/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MenuItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

const menuItems: MenuItem[] = [
  { name: "Inicio", href: "/", icon: Home },
  { name: "Vehículos", href: "/vehicles", icon: Car },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Ventas", href: "/sales", icon: DollarSign },
  { name: "Pendientes", href: "/pendencias", icon: AlertTriangle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const { user, signOut } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleChangePassword = async () => {
    setPasswordError("");

    if (!newPassword || newPassword.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }

    setChangingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setPasswordError(error.message);
        setChangingPassword(false);
        return;
      }

      // Sucesso
      setShowChangePassword(false);
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
      toast.success("Contraseña actualizada exitosamente", {
        description: "Su contraseña ha sido cambiada correctamente.",
      });
    } catch (err) {
      setPasswordError("Error inesperado al cambiar la contraseña");
    } finally {
      setChangingPassword(false);
    }
  };

  // Extrair nome do usuário do email (parte antes do @)
  const getUserName = () => {
    if (!user?.email) return "Usuario";
    const emailParts = user.email.split("@");
    return emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1);
  };

  return (
    <>
      <aside
        className={`fixed left-0 top-0 h-screen bg-white text-zinc-900 shadow-lg border-r border-zinc-200 transition-all duration-300 z-40 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="flex h-full flex-col relative">
          {/* Logo/Header */}
          <div
            className={`flex items-center gap-3 border-b border-zinc-200 px-6 py-6 transition-all ${
              isCollapsed ? "justify-center px-4" : ""
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shrink-0">
              <Car className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div className="transition-opacity duration-300">
                <h1 className="text-lg font-bold text-zinc-900">CellCars</h1>
                <p className="text-xs text-zinc-600">Concesionaria</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-6">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors relative group ${
                    isCollapsed ? "justify-center px-3" : ""
                  } ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                  title={isCollapsed ? item.name : ""}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && (
                    <span className="transition-opacity duration-300">
                      {item.name}
                    </span>
                  )}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-zinc-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Informações do Usuário e Ações */}
          <div className="mt-auto border-t border-zinc-200 pt-4 px-4 pb-4 space-y-2">
            {/* Nome do Usuário */}
            {user && (
              <div
                className={`flex items-center gap-3 px-4 py-2 text-zinc-700 ${
                  isCollapsed ? "justify-center" : ""
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold shrink-0">
                  {getUserName().charAt(0)}
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">
                      {getUserName()}
                    </p>
                    <p className="text-xs text-zinc-500 truncate">
                      {user.email}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Botão Cambiar Contraseña */}
            <button
              onClick={() => setShowChangePassword(true)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors ${
                isCollapsed ? "justify-center" : ""
              }`}
              title="Cambiar Contraseña"
            >
              <Key className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>Cambiar Contraseña</span>}
            </button>

            {/* Botão de Logout */}
            <button
              onClick={signOut}
              className={`w-full flex items-center gap-3 px-4 py-2 text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors ${
                isCollapsed ? "justify-center" : ""
              }`}
              title="Cerrar Sesión"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>Cerrar Sesión</span>}
            </button>
          </div>

          {/* Footer */}
          {!isCollapsed && (
            <div className="border-t border-zinc-200 px-6 py-4">
              <p className="text-xs text-zinc-500">
                © 2024 CellCars. Todos los derechos reservados.
              </p>
            </div>
          )}

          {/* Toggle Button - Metade dentro e metade fora */}
          <Button
            onClick={() => setIsCollapsed(!isCollapsed)}
            variant="outline"
            size="icon"
            className={`absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border-2 border-zinc-200 rounded-full shadow-md z-50 ${
              isCollapsed ? "rotate-180" : ""
            }`}
            aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
          >
            <ChevronRight className="h-4 w-4 text-zinc-700" />
          </Button>
        </div>
      </aside>

      {/* Modal Cambiar Contraseña */}
      <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-black">Cambiar Contraseña</DialogTitle>
            <DialogDescription>
              Ingrese su nueva contraseña. Debe tener al menos 6 caracteres.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                {passwordError}
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Nueva Contraseña
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Ingrese nueva contraseña"
                className="border-black text-black focus:border-black focus:ring-0"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Confirmar Nueva Contraseña
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme la nueva contraseña"
                className="border-black text-black focus:border-black focus:ring-0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowChangePassword(false);
                setNewPassword("");
                setConfirmPassword("");
                setPasswordError("");
              }}
              className="bg-white border-black text-black hover:bg-zinc-50"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={changingPassword}
              variant="outline"
              className="bg-white border-black text-black hover:bg-zinc-50"
            >
              {changingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cambiando...
                </>
              ) : (
                "Cambiar Contraseña"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
