"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Car, Image as ImageIcon, Search, Eye } from "lucide-react";
import { getVehicles, Vehicle } from "./actions";
import { TableLoading } from "@/components/ui/table-loading";
import { formatCurrency } from "@/lib/currency-utils";

interface VehicleWithImages extends Vehicle {
  images?: string[];
}

function VeiculosPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [veiculos, setVeiculos] = useState<VehicleWithImages[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");


  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "disponible":
        return "bg-green-100 text-green-800";
      case "vendido":
        return "bg-gray-100 text-gray-800";
      case "reservado":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case "disponible":
        return "Disponible";
      case "vendido":
        return "Vendido";
      case "reservado":
        return "Reservado";
      default:
        return status || "N/A";
    }
  };

  useEffect(() => {
    const loadVehicles = async () => {
      setLoading(true);
      try {
        const vehicles = await getVehicles();
        setVeiculos(vehicles as VehicleWithImages[]);
      } catch (error) {
        console.error("Error loading vehicles:", error);
      } finally {
        setLoading(false);
      }
    };
    loadVehicles();
  }, []);

  const filteredVehicles = useMemo(() => {
    if (!searchTerm) return veiculos;
    const term = searchTerm.toLowerCase();
    return veiculos.filter(
      (veiculo) =>
        veiculo.brand.toLowerCase().includes(term) ||
        veiculo.model.toLowerCase().includes(term) ||
        veiculo.plate.toLowerCase().includes(term) ||
        veiculo.color?.toLowerCase().includes(term)
    );
  }, [veiculos, searchTerm]);


  return (
    <div className="min-h-screen bg-white">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-zinc-900 flex items-center gap-2">
              Vehículos <Car className="h-8 w-8" />
            </h1>
            <p className="text-lg text-zinc-600">
              Gestione su inventario de vehículos para venta
            </p>
          </div>
          <Button
            onClick={() => router.push("/vehicles/new")}
            variant="outline"
            className="bg-white border-black text-black hover:bg-zinc-50"
          >
            + Agregar Vehículo
          </Button>
        </div>

        {/* Barra de búsqueda */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <Input
              type="text"
              placeholder="Buscar por marca, modelo, chapa o color..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de Veículos */}
        <div className="rounded-xl bg-white shadow-md">
          <div className="border-b border-zinc-200 p-6">
            <h2 className="text-xl font-semibold text-black">
              Lista de Vehículos ({filteredVehicles.length})
            </h2>
          </div>
          {loading && filteredVehicles.length === 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                      Imagen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                      Marca/Modelo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                      Año
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                      Color
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                      Precio Costo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                      Precio Venta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                      Margen de Ganancia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                      Chapa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white">
                  <TableLoading colSpan={10} message="Cargando vehículos..." />
                </tbody>
              </table>
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-lg text-zinc-500">
                {searchTerm
                  ? "No se encontraron vehículos con el término de búsqueda"
                  : "Ningún vehículo registrado aún."}
              </p>
              {!searchTerm && (
                <p className="mt-2 text-sm text-zinc-400">
                  Haga clic en "Agregar Vehículo" para comenzar.
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                      Imagen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                      Marca/Modelo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                      Año
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                      Color
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                      Precio Costo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                      Precio Venta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                      Margen de Ganancia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                      Chapa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white">
                  {filteredVehicles.map((veiculo) => {
                    const profitMargin = veiculo.cost_price > 0
                      ? (((veiculo.price - veiculo.cost_price) / veiculo.cost_price) * 100).toFixed(2)
                      : "0.00";
                    return (
                    <tr
                      key={veiculo.id}
                      className="hover:bg-zinc-50 cursor-pointer"
                      onClick={() => router.push(`/vehicles/${veiculo.id}`)}
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        {veiculo.images && veiculo.images.length > 0 ? (
                          <div className="h-16 w-16 overflow-hidden rounded-lg border border-zinc-200">
                            <img
                              src={veiculo.images[0]}
                              alt={`${veiculo.brand} ${veiculo.model}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-100">
                            <ImageIcon className="h-6 w-6 text-zinc-400" />
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="font-medium text-zinc-900">
                          {veiculo.brand} {veiculo.model}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-zinc-500">
                        {veiculo.year}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-zinc-500">
                        {veiculo.color || "N/A"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-zinc-600">
                        ${formatCurrency(veiculo.cost_price || 0)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-zinc-900">
                        ${formatCurrency(veiculo.price || 0)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-blue-600 font-semibold">
                        {profitMargin}%
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-zinc-500">
                        {veiculo.plate}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(veiculo.status)}`}
                        >
                          {getStatusLabel(veiculo.status)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/vehicles/${veiculo.id}`);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VeiculosPage() {
  return (
    <Suspense fallback={<div className="p-8"><p className="text-zinc-600">Cargando...</p></div>}>
      <VeiculosPageContent />
    </Suspense>
  );
}
