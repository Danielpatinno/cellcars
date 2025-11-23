"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  createSale,
  Sale,
} from "../actions";
import { getVehicles, Vehicle } from "@/app/vehicles/actions";
import { getClients, Client } from "@/app/clientes/actions";
import { CurrencyInput } from "@/components/ui/currency-input";

export default function NewSalePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  
  // Função para formatar moeda (igual ao CurrencyInput)
  const formatCurrency = (value: number) => {
    if (value === 0 || value === null || value === undefined) return "0,00";
    const formatted = (value / 100).toFixed(2).replace(".", ",");
    const parts = formatted.split(",");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.join(",");
  };

  // Função para formatar C.I.N (agrupa de 3 em 3 com pontos)
  const formatCIN = (value: string) => {
    if (!value) return "";
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    const formatted = numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return formatted;
  };
  
  const [formData, setFormData] = useState({
    vehicle_id: "",
    client_id: "",
    sale_date: "",
    total_amount: 0,
    payment_method: "Al contado",
    notes: "",
  });
  const [installments, setInstallments] = useState<
    {
      receipt_number: string;
      amount: number;
      due_date: string;
    }[]
  >([]);

  useEffect(() => {
    loadData();
    
    // Inicializar data de venda com data atual
    const today = new Date().toISOString().split("T")[0];
    setFormData((prev) => ({ ...prev, sale_date: today }));

    // Verificar se há vehicle_id na URL
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const vehicleId = params.get("vehicle_id");
      if (vehicleId) {
        setFormData((prev) => ({ ...prev, vehicle_id: vehicleId }));
      }
    }
  }, []);

  useEffect(() => {
    // Preencher total_amount quando selecionar veículo
    if (formData.vehicle_id) {
      const selectedVehicle = vehicles.find(
        (v) => v.id === parseInt(formData.vehicle_id)
      );
      if (selectedVehicle) {
        setFormData((prev) => ({
          ...prev,
          total_amount: selectedVehicle.price,
        }));
      }
    }
  }, [formData.vehicle_id, vehicles]);

  const loadData = async () => {
    try {
      const [vehiclesData, clientsData] = await Promise.all([
        getVehicles(),
        getClients(),
      ]);
      setVehicles(vehiclesData.filter((v) => v.status !== "vendido"));
      setClients(clientsData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const selectedVehicle = vehicles.find(
    (v) => v.id === parseInt(formData.vehicle_id)
  );

  const calculateProfitMargin = () => {
    if (!selectedVehicle || selectedVehicle.cost_price === 0) return 0;
    const profit = selectedVehicle.price - selectedVehicle.cost_price;
    return ((profit / selectedVehicle.cost_price) * 100).toFixed(2);
  };

  const addInstallment = () => {
    setInstallments([
      ...installments,
      {
        receipt_number: "",
        amount: 0,
        due_date: "",
      },
    ]);
  };

  const removeInstallment = (index: number) => {
    setInstallments(installments.filter((_, i) => i !== index));
  };

  const updateInstallment = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const updated = [...installments];
    updated[index] = { ...updated[index], [field]: value };
    setInstallments(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar que se seleccionó vehículo y cliente
      if (!formData.vehicle_id || !formData.client_id) {
        toast.error("Por favor seleccione un vehículo y un cliente");
        setLoading(false);
        return;
      }

      // Si es "A cuota", debe tener al menos un recibo
      if (
        formData.payment_method === "A cuota" &&
        installments.length === 0
      ) {
        toast.error("Debe agregar al menos un recibo/cuota para ventas a cuota");
        setLoading(false);
        return;
      }

      // Validar recibos
      for (const inst of installments) {
        if (!inst.receipt_number || inst.amount === 0 || !inst.due_date) {
          toast.error("Por favor complete todos los campos obligatorios de los recibos");
          setLoading(false);
          return;
        }
      }

      const result = await createSale({
        vehicle_id: parseInt(formData.vehicle_id),
        client_id: parseInt(formData.client_id),
        sale_date: formData.sale_date,
        total_amount: formData.total_amount,
        payment_method: formData.payment_method,
        notes: formData.notes || undefined,
        installments: installments,
      });

      if (result.success) {
        toast.success("Venta creada exitosamente");
        router.push(`/sales/${result.sale.id}`);
      } else {
        toast.error(result.message || "Error al crear venta");
      }
    } catch (error: any) {
      console.error("Error creating sale:", error);
      toast.error("Error al crear venta: " + (error.message || "Error desconocido"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" onClick={() => router.push("/sales")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <h1 className="text-3xl font-bold text-zinc-900">Nueva Venta</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-black">Información de la Venta</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-500">
                Vehículo *
              </label>
              <select
                required
                value={formData.vehicle_id}
                onChange={(e) =>
                  setFormData({ ...formData, vehicle_id: e.target.value })
                }
                className="w-full px-3 py-2 border border-black text-black bg-white rounded-lg focus:outline-none focus:border-black"
              >
                <option value="">Seleccione un vehículo</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.brand} {vehicle.model} {vehicle.year} - {vehicle.plate} - ${formatCurrency(vehicle.price)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-500">
                Cliente *
              </label>
              <select
                required
                value={formData.client_id}
                onChange={(e) =>
                  setFormData({ ...formData, client_id: e.target.value })
                }
                className="w-full px-3 py-2 border border-black text-black bg-white rounded-lg focus:outline-none focus:border-black"
              >
                <option value="">Seleccione un cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} - {formatCIN(client.cin)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-500">
                Fecha de Venta *
              </label>
              <Input
                type="date"
                required
                value={formData.sale_date}
                onChange={(e) =>
                  setFormData({ ...formData, sale_date: e.target.value })
                }
                className="border-black text-black focus:border-black focus:ring-0"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-500">
                Método de Pago *
              </label>
              <select
                required
                value={formData.payment_method}
                onChange={(e) =>
                  setFormData({ ...formData, payment_method: e.target.value })
                }
                className="w-full px-3 py-2 border border-black text-black bg-white rounded-lg focus:outline-none focus:border-black"
              >
                <option value="Al contado">Al contado</option>
                <option value="A cuota">A cuota</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-500">
                Monto Total *
              </label>
              <CurrencyInput
                value={formData.total_amount}
                onChange={(value) =>
                  setFormData({ ...formData, total_amount: value })
                }
              />
            </div>
            {selectedVehicle && (
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-500">
                  Margen de Lucro
                </label>
                <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-blue-900 font-semibold">
                    {calculateProfitMargin()}%
                  </span>
                </div>
              </div>
            )}
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-zinc-500">
                Notas
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full px-3 py-2 border border-black text-black bg-white rounded-lg focus:outline-none focus:border-black"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Recibos/Cuotas */}
        {formData.payment_method === "A cuota" && (
          <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-black">Recibos/Cuotas</h2>
              <Button type="button" onClick={addInstallment} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Recibo
              </Button>
            </div>

            {installments.length === 0 ? (
              <p className="text-zinc-600 text-sm">
                No hay recibos agregados. Agregue al menos uno.
              </p>
            ) : (
              <div className="space-y-4">
                {installments.map((inst, index) => (
                  <div
                    key={index}
                    className="border border-zinc-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">Recibo #{index + 1}</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeInstallment(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-zinc-500">
                          Número de Recibo *
                        </label>
                        <Input
                          required
                          value={inst.receipt_number}
                          onChange={(e) =>
                            updateInstallment(
                              index,
                              "receipt_number",
                              e.target.value
                            )
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
                          value={inst.amount}
                          onChange={(value) =>
                            updateInstallment(index, "amount", value)
                          }
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-zinc-500">
                          Fecha de Vencimiento *
                        </label>
                        <Input
                          type="date"
                          required
                          value={inst.due_date}
                          onChange={(e) =>
                            updateInstallment(index, "due_date", e.target.value)
                          }
                          className="border-black text-black focus:border-black focus:ring-0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            type="submit" 
            disabled={loading} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-base shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Crear Venta"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/sales")}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}

