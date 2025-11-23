"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Search, Check, Calendar } from "lucide-react";
import { toast } from "sonner";
import { TableLoading } from "@/components/ui/table-loading";
import {
  getPendingInstallments,
  markInstallmentAsPaid,
  getPendingInstallmentsCount,
  Installment,
} from "../sales/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FormattedDate from "@/components/FormattedDate";
import { CurrencyInput } from "@/components/ui/currency-input";

export default function PendenciasPage() {
  const [installments, setInstallments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "overdue">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showMarkAsPaidDialog, setShowMarkAsPaidDialog] = useState(false);
  const [selectedInstallmentId, setSelectedInstallmentId] = useState<number | null>(null);
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  useEffect(() => {
    loadInstallments();
    
    // Inicializar paymentDate com data atual
    const today = new Date().toISOString().split("T")[0];
    setPaymentDate(today);
  }, []);

  const loadInstallments = async () => {
    setLoading(true);
    try {
      const data = await getPendingInstallments();
      // Atualizar status para "vencido" se a data de vencimento passou
      const updated = data.map((inst: any) => {
        if (new Date(inst.due_date) < new Date() && inst.status === "pendiente") {
          return { ...inst, status: "vencido" };
        }
        return inst;
      });
      setInstallments(updated);
    } catch (error) {
      console.error("Error loading installments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!selectedInstallmentId || !paymentDate) {
      toast.error("Por favor seleccione una fecha de pago");
      return;
    }

    setLoading(true);
    try {
      const result = await markInstallmentAsPaid(selectedInstallmentId, paymentDate, paymentNotes || null);
      if (result.success) {
        toast.success("Recibo marcado como pagado exitosamente");
        setShowMarkAsPaidDialog(false);
        setSelectedInstallmentId(null);
        setPaymentNotes("");
        loadInstallments();
      } else {
        toast.error(result.message || "Error al marcar como pagado");
      }
    } catch (error: any) {
      console.error("Error marking as paid:", error);
      toast.error("Error al marcar como pagado: " + (error.message || "Error desconocido"));
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const filteredInstallments = useMemo(() => {
    let filtered = installments;

    // Filtrar por status
    if (filter === "pending") {
      filtered = filtered.filter((inst) => inst.status === "pendiente");
    } else if (filter === "overdue") {
      filtered = filtered.filter((inst) => isOverdue(inst.due_date) && inst.status !== "pagado");
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (inst) =>
          inst.receipt_number.toLowerCase().includes(term) ||
          inst.client_name.toLowerCase().includes(term) ||
          inst.vehicle_info.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [installments, filter, searchTerm]);

  const totalPending = installments.filter((inst) => inst.status === "pendiente").length;
  const totalOverdue = installments.filter((inst) => isOverdue(inst.due_date) && inst.status !== "pagado").length;
  const totalAmount = filteredInstallments.reduce((sum, inst) => sum + inst.amount, 0);

  // Função para formatar moeda (igual ao CurrencyInput)
  const formatCurrency = (value: number) => {
    if (value === 0 || value === null || value === undefined) return "0,00";
    const formatted = (value / 100).toFixed(2).replace(".", ",");
    const parts = formatted.split(",");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.join(",");
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-zinc-900">Pendientes</h1>
        <p className="text-zinc-600 mt-1">Gestión de recibos y cuotas pendientes</p>
      </div>

      {/* Cards de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-600">Total Pendientes</p>
              <p className="text-2xl font-bold text-zinc-900 mt-1">
                {installments.length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-600">Pendientes</p>
              <p className="text-2xl font-bold text-zinc-900 mt-1">
                {totalPending}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-600">Vencidos</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {totalOverdue}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            size="sm"
          >
            Todos
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
            size="sm"
          >
            Pendientes
          </Button>
          <Button
            variant={filter === "overdue" ? "default" : "outline"}
            onClick={() => setFilter("overdue")}
            size="sm"
          >
            Vencidos
          </Button>
        </div>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
          <Input
            type="text"
            placeholder="Buscar por número de recibo, cliente o vehículo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista de recibos */}
      {loading ? (
        <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Número de Recibo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Vehículo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Vencimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-black uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-zinc-200">
                <TableLoading colSpan={7} message="Cargando recibos..." />
              </tbody>
            </table>
          </div>
        </div>
      ) : filteredInstallments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-zinc-200">
          <AlertTriangle className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
          <p className="text-zinc-600">
            {searchTerm
              ? "No se encontraron recibos con el término de búsqueda"
              : "No hay recibos pendientes"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Número de Recibo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Vehículo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Vencimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-black uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-zinc-200">
                {filteredInstallments.map((installment) => {
                  const overdue = isOverdue(installment.due_date);
                  return (
                    <tr
                      key={installment.id}
                      className={overdue ? "bg-red-50" : ""}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-zinc-900">
                          {installment.receipt_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-zinc-900">
                          {installment.client_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-zinc-600">
                          {installment.vehicle_info}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-zinc-900">
                          {formatCurrency(installment.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-zinc-600">
                          <FormattedDate date={installment.due_date} format="date" />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            overdue
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {overdue ? "Vencido" : "Pendiente"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedInstallmentId(installment.id);
                            setShowMarkAsPaidDialog(true);
                          }}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Marcar como Pago
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dialog para marcar como pago */}
      <Dialog open={showMarkAsPaidDialog} onOpenChange={setShowMarkAsPaidDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-black">Marcar como Pagado</DialogTitle>
            <DialogDescription>
              Seleccione la fecha de pago para este recibo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-black">
                Fecha de Pago *
              </label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="border-black text-black focus:border-black focus:ring-0"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-black">
                Notas
              </label>
              <textarea
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                className="w-full px-3 py-2 border border-black text-black bg-white rounded-lg focus:outline-none focus:border-black"
                rows={3}
                placeholder="Notas adicionales sobre este pago..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowMarkAsPaidDialog(false);
                setSelectedInstallmentId(null);
                setPaymentNotes("");
              }}
              className="bg-white border-black text-black hover:bg-zinc-50"
            >
              Cancelar
            </Button>
            <Button onClick={handleMarkAsPaid} disabled={loading} variant="outline" className="bg-white border-black text-black hover:bg-zinc-50">
              Confirmar Pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

