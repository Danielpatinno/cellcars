"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, X, Check, Calendar } from "lucide-react";
import { toast } from "sonner";
import {
  getSaleById,
  addInstallment,
  markInstallmentAsPaid,
  Sale,
  Installment,
} from "../actions";
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
import { formatCurrency } from "@/lib/currency-utils";

export default function SaleDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  const [sale, setSale] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddInstallment, setShowAddInstallment] = useState(false);
  const [showMarkAsPaid, setShowMarkAsPaid] = useState(false);
  const [selectedInstallmentId, setSelectedInstallmentId] = useState<number | null>(null);
  const [paymentDate, setPaymentDate] = useState("");
  const [newInstallment, setNewInstallment] = useState({
    receipt_number: "",
    amount: 0,
    due_date: "",
  });
  const [paymentNotes, setPaymentNotes] = useState("");

  useEffect(() => {
    loadSale();
    
    // Inicializar paymentDate com data atual
    const today = new Date().toISOString().split("T")[0];
    setPaymentDate(today);
  }, [id]);

  const loadSale = async () => {
    setLoading(true);
    try {
      const data = await getSaleById(id);
      setSale(data);
    } catch (error) {
      console.error("Error loading sale:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInstallment = async () => {
    if (!newInstallment.receipt_number || newInstallment.amount === 0 || !newInstallment.due_date) {
      toast.error("Por favor complete todos los campos");
      return;
    }

    setLoading(true);
    try {
      const result = await addInstallment(id, newInstallment);
      if (result.success) {
        toast.success("Recibo agregado exitosamente");
        setShowAddInstallment(false);
        setNewInstallment({
          receipt_number: "",
          amount: 0,
          due_date: "",
        });
        loadSale();
      } else {
        toast.error(result.message || "Error al agregar recibo");
      }
    } catch (error: any) {
      console.error("Error adding installment:", error);
      toast.error("Error al agregar recibo: " + (error.message || "Error desconocido"));
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
        setShowMarkAsPaid(false);
        setSelectedInstallmentId(null);
        setPaymentDate("");
        setPaymentNotes("");
        loadSale();
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
    return new Date(dueDate) < new Date() && !sale?.installments?.find((inst: Installment) => inst.due_date === dueDate)?.payment_date;
  };

  const calculateProfitMargin = () => {
    if (!sale?.vehicle || sale.vehicle.cost_price === 0) return 0;
    const profit = sale.vehicle.price - sale.vehicle.cost_price;
    return ((profit / sale.vehicle.cost_price) * 100).toFixed(2);
  };

  if (loading && !sale) {
    return (
      <div className="p-8">
        <p className="text-zinc-600">Cargando...</p>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="p-8">
        <p className="text-zinc-600">Venta no encontrada</p>
        <Button onClick={() => router.push("/sales")} className="mt-4">
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" onClick={() => router.push("/sales")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <h1 className="text-3xl font-bold text-zinc-900">Detalles de la Venta</h1>
      </div>

      <div className="space-y-6">
        {/* Información de la Venta */}
        <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-black">Información de la Venta</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-zinc-500">Vehículo</label>
              <p className="mt-1 text-lg text-zinc-900">
                {sale.vehicle
                  ? `${sale.vehicle.brand} ${sale.vehicle.model} ${sale.vehicle.year} - ${sale.vehicle.plate}`
                  : "N/A"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-500">Cliente</label>
              <p className="mt-1 text-lg text-zinc-900">
                {sale.client?.name || "N/A"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-500">Fecha de Venta</label>
              <p className="mt-1 text-lg text-zinc-900">
                <FormattedDate date={sale.sale_date} format="date" />
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-500">Método de Pago</label>
              <p className="mt-1 text-lg text-zinc-900">{sale.payment_method}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-500">Monto Total</label>
              <p className="mt-1 text-lg font-bold text-zinc-900">
                {formatCurrency(sale.total_amount)}
              </p>
            </div>
            {sale.vehicle && (
              <div>
                <label className="text-sm font-medium text-zinc-500">Margen de Lucro</label>
                <p className="mt-1 text-lg font-semibold text-blue-600">
                  {calculateProfitMargin()}%
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-zinc-500">Estado</label>
              <p className="mt-1">
                <span
                  className={`px-2 py-1 text-sm font-medium rounded ${
                    sale.status === "completado"
                      ? "bg-green-100 text-green-800"
                      : sale.status === "pendiente"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {sale.status}
                </span>
              </p>
            </div>
            {sale.notes && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-zinc-500">Notas</label>
                <p className="mt-1 text-zinc-900">{sale.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Recibos/Cuotas */}
        <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-black">Recibos/Cuotas</h2>
            <Button onClick={() => setShowAddInstallment(true)} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Recibo
            </Button>
          </div>

          {sale.installments && sale.installments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase">
                      Número
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase">
                      Monto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase">
                      Vencimiento
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase">
                      Pago
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase">
                      Notas
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-zinc-700 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {sale.installments.map((inst: Installment) => {
                    const overdue = isOverdue(inst.due_date);
                    const isPaid = inst.status === "pagado";
                    return (
                      <tr key={inst.id} className={overdue && !isPaid ? "bg-red-50" : ""}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-zinc-900">
                            {inst.receipt_number}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-zinc-900">
                            {formatCurrency(inst.amount)}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-zinc-600">
                            <FormattedDate date={inst.due_date} format="date" />
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-zinc-600">
                            {inst.payment_date ? (
                              <FormattedDate date={inst.payment_date} format="date" />
                            ) : (
                              "-"
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              isPaid
                                ? "bg-green-100 text-green-800"
                                : overdue
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {isPaid ? "Pagado" : overdue ? "Vencido" : "Pendiente"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-zinc-600 max-w-xs truncate">
                            {inst.notes || "-"}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          {!isPaid && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedInstallmentId(inst.id);
                                setShowMarkAsPaid(true);
                              }}
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Marcar como Pago
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-zinc-600 text-sm">No hay recibos registrados</p>
          )}
        </div>
      </div>

      {/* Dialog para agregar recibo */}
      <Dialog open={showAddInstallment} onOpenChange={setShowAddInstallment}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-black">Agregar Recibo/Cuota</DialogTitle>
            <DialogDescription>
              Agregue un nuevo recibo a esta venta
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-500">
                Número de Recibo *
              </label>
              <Input
                value={newInstallment.receipt_number}
                onChange={(e) =>
                  setNewInstallment({
                    ...newInstallment,
                    receipt_number: e.target.value,
                  })
                }
                placeholder="Ej: 001"
                className="border-black text-black focus:border-black focus:ring-0"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-500">
                Monto *
              </label>
              <CurrencyInput
                value={newInstallment.amount}
                onChange={(value) =>
                  setNewInstallment({ ...newInstallment, amount: value })
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-500">
                Fecha de Vencimiento *
              </label>
              <Input
                type="date"
                value={newInstallment.due_date}
                onChange={(e) =>
                  setNewInstallment({ ...newInstallment, due_date: e.target.value })
                }
                className="border-black text-black focus:border-black focus:ring-0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddInstallment(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddInstallment} variant="outline" className="bg-white border-black text-black hover:bg-zinc-50">Agregar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para marcar como pago */}
      <Dialog open={showMarkAsPaid} onOpenChange={setShowMarkAsPaid}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-black">Marcar como Pagado</DialogTitle>
            <DialogDescription>
              Seleccione la fecha de pago para este recibo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-500">
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
              <label className="mb-1 block text-sm font-medium text-zinc-500">
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
            <Button variant="outline" onClick={() => {
              setShowMarkAsPaid(false);
              setPaymentNotes("");
            }} className="bg-white border-black text-black hover:bg-zinc-50">
              Cancelar
            </Button>
            <Button onClick={handleMarkAsPaid} variant="outline" className="bg-white border-black text-black hover:bg-zinc-50">Confirmar Pago</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

