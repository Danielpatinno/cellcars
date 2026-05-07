"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CurrencyInput } from "@/components/ui/currency-input";
import { formatThousands, parseThousands } from "@/lib/number-utils";
import { useUpdateVehicle } from "@/hooks/vehicles/useVehicleMutations";
import type { VehicleWithImages } from "@/lib/api/vehicles";

type FormState = {
  brand: string;
  model: string;
  year: number;
  color: string;
  plate: string;
  mileage: number;
  status: string;
  cost_price: number;
  price: number;
};

function toForm(v: VehicleWithImages): FormState {
  return {
    brand: v.brand ?? "",
    model: v.model ?? "",
    year: v.year ?? new Date().getFullYear(),
    color: (v.color as any) ?? "",
    plate: v.plate ?? "",
    mileage: v.mileage ?? 0,
    status: (v.status as any) ?? "disponible",
    cost_price: v.cost_price ?? 0,
    price: v.price ?? 0,
  };
}

export default function VehicleEditDialog({
  open,
  onOpenChange,
  vehicle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: VehicleWithImages | null;
}) {
  const updateMutation = useUpdateVehicle();
  const saving = updateMutation.isPending;
  const [form, setForm] = useState<FormState | null>(vehicle ? toForm(vehicle) : null);

  const mileageDisplay = useMemo(
    () => formatThousands(form?.mileage ?? 0),
    [form?.mileage],
  );

  useEffect(() => {
    if (!open || !vehicle) return;
    setForm(toForm(vehicle));
  }, [open, vehicle]);

  const onSave = async () => {
    if (!vehicle || !form) return;
    try {
      await updateMutation.mutateAsync({
        id: vehicle.id,
        input: {
          brand: form.brand.trim(),
          model: form.model.trim(),
          year: Number(form.year),
          color: form.color.trim() || null,
          plate: form.plate.trim().toUpperCase(),
          mileage: Number(form.mileage),
          status: form.status,
          cost_price: Number(form.cost_price),
          price: Number(form.price),
        },
      });
      toast.success("Vehículo actualizado");
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message || "Error al guardar");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-3xl rounded-3xl p-0 overflow-hidden">
        <div className="px-7 pt-7 pb-5 border-b border-zinc-200/70">
          <DialogHeader className="gap-1">
            <DialogTitle className="text-zinc-900 text-xl tracking-tight">
              Editar Vehículo
            </DialogTitle>
            <DialogDescription className="text-zinc-600">
              Edite la información principal sin salir de la tabla.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-7 py-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-600">
                Marca *
              </label>
              <Input
                value={form?.brand ?? ""}
                onChange={(e) => setForm((p) => (p ? { ...p, brand: e.target.value } : p))}
                className="bg-white border-zinc-200 text-zinc-900 focus-visible:border-zinc-300"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-600">
                Modelo *
              </label>
              <Input
                value={form?.model ?? ""}
                onChange={(e) => setForm((p) => (p ? { ...p, model: e.target.value } : p))}
                className="bg-white border-zinc-200 text-zinc-900 focus-visible:border-zinc-300"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-600">
                Año *
              </label>
              <Input
                type="number"
                value={form?.year ?? 0}
                onChange={(e) =>
                  setForm((p) =>
                    p ? { ...p, year: Number(e.target.value || 0) } : p,
                  )
                }
                className="bg-white border-zinc-200 text-zinc-900 focus-visible:border-zinc-300"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-600">
                Color
              </label>
              <Input
                value={form?.color ?? ""}
                onChange={(e) => setForm((p) => (p ? { ...p, color: e.target.value } : p))}
                className="bg-white border-zinc-200 text-zinc-900 focus-visible:border-zinc-300"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-600">
                Chapa
              </label>
              <Input
                value={form?.plate ?? ""}
                onChange={(e) => setForm((p) => (p ? { ...p, plate: e.target.value } : p))}
                className="bg-white border-zinc-200 text-zinc-900 focus-visible:border-zinc-300"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-600">
                Kilometraje
              </label>
              <Input
                type="text"
                inputMode="numeric"
                value={mileageDisplay}
                onChange={(e) =>
                  setForm((p) =>
                    p ? { ...p, mileage: parseThousands(e.target.value) } : p,
                  )
                }
                className="bg-white border-zinc-200 text-zinc-900 focus-visible:border-zinc-300"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-600">
                Precio de Costo
              </label>
              <CurrencyInput
                value={form?.cost_price ?? 0}
                onChange={(value) => setForm((p) => (p ? { ...p, cost_price: value } : p))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-600">
                Precio de Venta
              </label>
              <CurrencyInput
                value={form?.price ?? 0}
                onChange={(value) => setForm((p) => (p ? { ...p, price: value } : p))}
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-zinc-600">
                Estado
              </label>
              <select
                value={form?.status ?? "disponible"}
                onChange={(e) => setForm((p) => (p ? { ...p, status: e.target.value } : p))}
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="disponible">Disponible</option>
                <option value="reservado">Reservado</option>
                <option value="vendido">Vendido</option>
              </select>
            </div>
          </div>
        </div>

        <div className="px-7 pb-7">
          <DialogFooter className="pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
              className="bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50"
            >
              Cancelar
            </Button>
            <Button
              onClick={onSave}
              disabled={saving}
              className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

