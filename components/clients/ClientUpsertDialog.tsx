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
import { formatCIN, formatPhone, unformatCIN, unformatPhone } from "@/lib/client-utils";
import { type Client } from "@/app/clientes/actions";
import { useCreateClient, useUpdateClient } from "@/hooks/clients/useClientMutations";

type ClientFormState = {
  name: string;
  cin: string;
  phone: string;
  email: string;
  address: string;
  birth_date: string;
};

function toFormState(client?: Client | null): ClientFormState {
  return {
    name: client?.name ?? "",
    cin: client?.cin ?? "",
    phone: client?.phone ?? "",
    email: client?.email ?? "",
    address: client?.address ?? "",
    birth_date: client?.birth_date ? client.birth_date.split("T")[0] : "",
  };
}

export default function ClientUpsertDialog({
  open,
  onOpenChange,
  client,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
  onSaved?: () => void;
}) {
  const isEdit = Boolean(client?.id);
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();
  const saving = createMutation.isPending || updateMutation.isPending;
  const [form, setForm] = useState<ClientFormState>(() => toFormState(client));

  const cinDisplay = useMemo(() => formatCIN(form.cin), [form.cin]);
  const phoneDisplay = useMemo(() => formatPhone(form.phone), [form.phone]);

  useEffect(() => {
    if (!open) return;
    setForm(toFormState(client));
  }, [open, client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    try {
      if (isEdit && client) {
        await updateMutation.mutateAsync({
          id: client.id,
          input: {
            name: form.name.trim(),
            cin: unformatCIN(form.cin),
            phone: unformatPhone(form.phone),
            email: form.email.trim() || null,
            address: form.address.trim() || null,
            birth_date: form.birth_date || null,
          },
        });
        toast.success("Cliente actualizado exitosamente");
      } else {
        await createMutation.mutateAsync({
          name: form.name.trim(),
          cin: unformatCIN(form.cin),
          phone: unformatPhone(form.phone),
          email: form.email.trim() || null,
          address: form.address.trim() || null,
          birth_date: form.birth_date || null,
        });
        toast.success("Cliente creado exitosamente");
      }

      onOpenChange(false);
      onSaved?.();
    } catch (err) {
      toast.error("Error inesperado");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-2xl rounded-3xl p-0 overflow-hidden">
        <div className="px-7 pt-7 pb-5 border-b border-zinc-200/70">
          <DialogHeader className="gap-1">
            <DialogTitle className="text-zinc-900 text-xl tracking-tight">
              {isEdit ? "Editar Cliente" : "Nuevo Cliente"}
            </DialogTitle>
            <DialogDescription className="text-zinc-600">
              {isEdit
                ? "Actualice los datos del cliente y guarde los cambios."
                : "Complete los datos para registrar un nuevo cliente."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="px-7 py-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-600">
                Nombre Completo *
              </label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nombre completo"
                className="bg-white border-zinc-200 text-zinc-900 focus-visible:border-zinc-300"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-600">
                C.I.N *
              </label>
              <Input
                required
                value={cinDisplay}
                onChange={(e) =>
                  setForm({ ...form, cin: unformatCIN(e.target.value) })
                }
                placeholder="0.000.000"
                maxLength={14}
                className="bg-white border-zinc-200 text-zinc-900 focus-visible:border-zinc-300"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-600">
                Teléfono *
              </label>
              <Input
                required
                value={phoneDisplay}
                onChange={(e) =>
                  setForm({ ...form, phone: unformatPhone(e.target.value) })
                }
                placeholder="0986 381-491"
                className="bg-white border-zinc-200 text-zinc-900 focus-visible:border-zinc-300"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-600">
                Correo Electrónico
              </label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="correo@ejemplo.com"
                className="bg-white border-zinc-200 text-zinc-900 focus-visible:border-zinc-300"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-600">
                Dirección
              </label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Dirección"
                className="bg-white border-zinc-200 text-zinc-900 focus-visible:border-zinc-300"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-600">
                Fecha de Nacimiento
              </label>
              <Input
                type="date"
                value={form.birth_date}
                onChange={(e) =>
                  setForm({ ...form, birth_date: e.target.value })
                }
                className="bg-white border-zinc-200 text-zinc-900 focus-visible:border-zinc-300"
              />
            </div>
          </div>

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
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Guardando..." : isEdit ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

