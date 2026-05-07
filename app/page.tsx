"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Car,
  Users,
  AlertTriangle,
  DollarSign,
  Plus,
  Loader2,
} from "lucide-react";
import { useAuth } from "./hooks/useAuth";
import { useDashboardStats } from "@/hooks/dashboard/useDashboardStats";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const statsQuery = useDashboardStats();
  const loading = statsQuery.isLoading;
  const vehiclesCount = statsQuery.data?.vehiclesCount ?? 0;
  const clientsCount = statsQuery.data?.clientsCount ?? 0;
  const pendingCount = statsQuery.data?.pendingCount ?? 0;
  const salesCount = statsQuery.data?.salesCount ?? 0;

  // Extrair nome do usuário do email (parte antes do @)
  const getUserName = () => {
    if (!user?.email) return "Usuario";
    const emailParts = user.email.split("@");
    return emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1);
  };

  const stats = [
    {
      name: "Vehículos",
      value: loading ? (
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      ) : (
        vehiclesCount
      ),
      icon: Car,
      color: "bg-blue-100 text-blue-600",
      href: "/vehicles",
    },
    {
      name: "Clientes",
      value: loading ? (
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      ) : (
        clientsCount
      ),
      icon: Users,
      color: "bg-green-100 text-green-600",
      href: "/clientes",
    },
    {
      name: "Pendientes",
      value: loading ? (
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      ) : (
        pendingCount
      ),
      icon: AlertTriangle,
      color: "bg-yellow-100 text-yellow-600",
      href: "/pendencias",
    },
    {
      name: "Ventas del Mes",
      value: loading ? (
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      ) : (
        salesCount
      ),
      icon: DollarSign,
      color: "bg-purple-100 text-purple-600",
      href: "/sales",
    },
  ];

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">Bienvenido, {getUserName()}</h1>
        <p className="text-zinc-600 mt-2">
          Tu sistema de gestión
        </p>
      </div>

      {/* Cards de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-lg border border-zinc-200 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push(stat.href)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 mb-1">{stat.name}</p>
                <p className="text-3xl font-bold text-zinc-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-black">Acciones Rápidas</h2>
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={() => router.push("/vehicles/new")}
            variant="outline"
            className="bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50"
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar Vehículo
          </Button>
          <Button onClick={() => router.push("/clientes")} variant="outline" className="bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/sales/new")}
            className="bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50"
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Nueva Venta
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/pendencias")}
            className="bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50"
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Ver Pendientes
          </Button>
        </div>
      </div>
    </div>
  );
}
