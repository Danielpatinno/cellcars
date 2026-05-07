"use client";

import { useMemo, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Car, Image as ImageIcon, Search, Eye, Edit } from "lucide-react";
import { type Vehicle } from "./actions";
import { TableLoading } from "@/components/ui/table-loading";
import { formatCurrency } from "@/lib/currency-utils";
import { useVehicles } from "@/hooks/vehicles/useVehicles";
import VehicleEditDialog from "@/components/vehicles/VehicleEditDialog";
import type { VehicleWithImages as VehicleApi } from "@/lib/api/vehicles";

interface VehicleWithImages extends Vehicle {
  images?: string[];
}

function VeiculosPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vehiclesQuery = useVehicles();
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<VehicleApi | null>(null);
  const veiculos = (vehiclesQuery.data || []) as VehicleWithImages[];
  const loading = vehiclesQuery.isLoading;


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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 flex items-center gap-2">
            Vehículos <Car className="h-7 w-7" />
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Gestione su inventario de vehículos para venta
          </p>
        </div>
        <Button
          onClick={() => router.push("/vehicles/new")}
          variant="default"
          className="bg-blue-600 text-white border border-blue-600 hover:bg-blue-700"
        >
          + Agregar Vehículo
        </Button>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
        <Input
          type="text"
          placeholder="Buscar por marca, modelo, chapa o color..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white/80"
        />
      </div>

      {/* Lista de Veículos */}
      <div className="rounded-2xl bg-white/80 backdrop-blur border border-zinc-200/70 shadow-sm overflow-hidden">
        <div className="border-b border-zinc-200/70 px-6 py-5">
          <h2 className="text-base font-semibold text-zinc-900">
            Lista de Vehículos{" "}
            <span className="text-zinc-500 font-medium">
              ({filteredVehicles.length})
            </span>
          </h2>
        </div>
          {loading && filteredVehicles.length === 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700">
                      Imagen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700">
                      Marca/Modelo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700">
                      Año
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700">
                      Color
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700">
                      Precio Costo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700">
                      Precio Venta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700">
                      Margen de Ganancia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700">
                      Chapa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-700">
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
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700">
                      Imagen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700">
                      Marca/Modelo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700">
                      Año
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700">
                      Color
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700">
                      Precio Costo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700">
                      Precio Venta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700">
                      Margen de Ganancia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700">
                      Chapa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-700">
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
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setVehicleToEdit(veiculo as any);
                              setShowEditDialog(true);
                            }}
                            className="bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50"
                            aria-label="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/vehicles/${veiculo.id}`);
                            }}
                            className="bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50"
                            aria-label="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
      </div>

      <VehicleEditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        vehicle={vehicleToEdit}
      />
    </div>
  );
}

export default function VeiculosPage() {
  return (
    <Suspense fallback={<div><p className="text-zinc-600">Cargando...</p></div>}>
      <VeiculosPageContent />
    </Suspense>
  );
}
