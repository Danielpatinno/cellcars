"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, Plus, Search, Calendar, Eye, Trash2 } from "lucide-react";
import { type Sale } from "./actions";
import FormattedDate from "@/components/FormattedDate";
import { TableLoading } from "@/components/ui/table-loading";
import { formatCurrency } from "@/lib/currency-utils";
import { useSales } from "@/hooks/sales/useSales";
import { useDeleteSale } from "@/hooks/sales/useSaleMutations";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function SalesPage() {
  const router = useRouter();
  const salesQuery = useSales();
  const deleteSaleMutation = useDeleteSale();
  const sales = (salesQuery.data || []) as Sale[];
  const loading = salesQuery.isLoading;
  const [searchTerm, setSearchTerm] = useState("");
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);

  const filteredSales = useMemo(() => {
    if (!searchTerm) return sales;
    const term = searchTerm.toLowerCase();
    return sales.filter(
      (sale) =>
        sale.client?.name.toLowerCase().includes(term) ||
        sale.vehicle?.brand.toLowerCase().includes(term) ||
        sale.vehicle?.model.toLowerCase().includes(term) ||
        sale.vehicle?.plate.toLowerCase().includes(term) ||
        sale.payment_method.toLowerCase().includes(term)
    );
  }, [sales, searchTerm]);

  const confirmDeleteSale = async () => {
    if (!saleToDelete) return;
    try {
      await deleteSaleMutation.mutateAsync(saleToDelete.id);
      toast.success("Venta eliminada. El vehículo volvió a disponible.");
      setSaleToDelete(null);
    } catch (error: any) {
      toast.error("Error al eliminar venta: " + (error.message || "Error desconocido"));
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            Ventas
          </h1>
          <p className="mt-1 text-sm text-zinc-600">Gestión de ventas</p>
        </div>
        <Button
          onClick={() => router.push("/sales/new")}
          variant="default"
          className="bg-blue-600 text-white border border-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Venta
        </Button>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
        <Input
          type="text"
          placeholder="Buscar por cliente, vehículo o método de pago..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white/80"
        />
      </div>

      {/* Lista de vendas */}
      {loading ? (
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-zinc-200/70 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Vehículo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Monto Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Método de Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Situación
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-zinc-700 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-zinc-200">
                <TableLoading colSpan={7} message="Cargando ventas..." />
              </tbody>
            </table>
          </div>
        </div>
      ) : filteredSales.length === 0 ? (
        <div className="text-center py-12 bg-white/80 backdrop-blur rounded-2xl border border-zinc-200/70 shadow-sm">
          <DollarSign className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
          <p className="text-zinc-600">
            {searchTerm
              ? "No se encontraron ventas con el término de búsqueda"
              : "No hay ventas registradas"}
          </p>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-zinc-200/70 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Vehículo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Monto Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Método de Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Situación
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-zinc-700 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-zinc-200">
                {filteredSales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="hover:bg-zinc-50 cursor-pointer"
                    onClick={() => router.push(`/sales/${sale.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-zinc-900">
                        <Calendar className="h-4 w-4 text-zinc-400" />
                        <FormattedDate
                          date={sale.sale_date}
                          format="date"
                          options={{ year: "numeric", month: "2-digit", day: "2-digit" }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-zinc-900">
                        {sale.client?.name || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-zinc-900">
                        {sale.vehicle
                          ? `${sale.vehicle.brand} ${sale.vehicle.model} ${sale.vehicle.year} - ${sale.vehicle.plate}`
                          : "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-zinc-900">
                        {formatCurrency(sale.total_amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-zinc-600">
                        {sale.payment_method}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          sale.status === "completado"
                            ? "bg-green-100 text-green-800"
                            : sale.status === "pendiente"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {sale.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="inline-flex flex-wrap justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/sales/${sale.id}`);
                          }}
                          className="bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalles
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSaleToDelete(sale);
                          }}
                          className="border-red-200 bg-white text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Dialog
        open={saleToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setSaleToDelete(null);
        }}
      >
        <DialogContent className="bg-white" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle className="text-black">¿Eliminar esta venta?</DialogTitle>
            <DialogDescription>
              Se eliminará la venta
              {saleToDelete?.vehicle
                ? ` del vehículo ${saleToDelete.vehicle.brand} ${saleToDelete.vehicle.model} — ${saleToDelete.vehicle.plate}`
                : ""}
              . Los recibos/cuotas se borrarán y el vehículo volverá a{" "}
              <strong className="text-zinc-800">Disponible</strong>. No se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSaleToDelete(null)}
              disabled={deleteSaleMutation.isPending}
              className="bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => void confirmDeleteSale()}
              disabled={deleteSaleMutation.isPending}
              className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
            >
              Eliminar venta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

