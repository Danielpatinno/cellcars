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
import { getVehiclesCount } from "./vehicles/actions";
import { getClientsCount } from "./clientes/actions";
import {
  getPendingInstallmentsCount,
  getSalesCountThisMonth,
} from "./sales/actions";

export default function Home() {
  const router = useRouter();
  const [vehiclesCount, setVehiclesCount] = useState(0);
  const [clientsCount, setClientsCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [salesCount, setSalesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    setLoading(true);
    try {
      const [vehicles, clients, pending, sales] = await Promise.all([
        getVehiclesCount(),
        getClientsCount(),
        getPendingInstallmentsCount(),
        getSalesCountThisMonth(),
      ]);
      setVehiclesCount(vehicles);
      setClientsCount(clients);
      setPendingCount(pending);
      setSalesCount(sales);
    } catch (error) {
      console.error("Error loading counts:", error);
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-3xl font-bold text-zinc-900">Bienvenido a CellCars</h1>
        <p className="text-zinc-600 mt-2">
          Sistema de gestión para concesionaria
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
          <Button onClick={() => router.push("/vehicles?new=true")} variant="outline" className="bg-white border-black text-black hover:bg-zinc-50">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Vehículo
          </Button>
          <Button onClick={() => router.push("/clientes?new=true")} variant="outline" className="bg-white border-black text-black hover:bg-zinc-50">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/sales/new")}
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Nueva Venta
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/pendencias")}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Ver Pendientes
          </Button>
        </div>
      </div>
    </div>
  );
}
