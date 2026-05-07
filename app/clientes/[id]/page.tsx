"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { type Client } from "../actions";
import { getSales, Sale } from "@/app/sales/actions";
import ClientDetailsHeader from "@/components/clientDetails/ClientDetailsHeader";
import ClientPersonalInfo from "@/components/clientDetails/ClientPersonalInfo";
import ClientContactInfo from "@/components/clientDetails/ClientContactInfo";
import ClientAdditionalInfo from "@/components/clientDetails/ClientAdditionalInfo";
import ClientSalesHistory from "@/components/clientDetails/ClientSalesHistory";
import DeleteClientDetailsDialog from "@/components/clientDetails/DeleteClientDetailsDialog";
import { calculateAge } from "@/lib/date-utils";
import { useWhatsApp } from "@/hooks/useWhatsApp";
import ClientUpsertDialog from "@/components/clients/ClientUpsertDialog";
import { useClient } from "@/hooks/clients/useClient";
import { useDeleteClient } from "@/hooks/clients/useClientMutations";

export default function ClientDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  const [sales, setSales] = useState<Sale[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { openWhatsApp } = useWhatsApp();
  const clientQuery = useClient(Number.isFinite(id) ? id : null);
  const deleteMutation = useDeleteClient();
  const client = clientQuery.data ?? null;
  const loading = clientQuery.isLoading || deleteMutation.isPending;
  const age = useMemo(
    () => (client ? calculateAge(client.birth_date) : null),
    [client?.birth_date],
  );

  useEffect(() => {
    loadSales();
  }, [id]);

  const loadSales = async () => {
    try {
      const allSales = await getSales();
      const clientSales = allSales.filter((sale) => sale.client_id === id);
      setSales(clientSales);
    } catch (error) {
      console.error("Error loading sales:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Cliente eliminado exitosamente");
      router.push("/clientes");
    } catch (error: any) {
      toast.error("Error al eliminar cliente: " + (error.message || "Error desconocido"));
    }
  };

  if (loading && !client) {
    return (
      <div>
        <p className="text-zinc-600">Cargando...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div>
        <p className="text-zinc-600">Cliente no encontrado</p>
        <Button
          onClick={() => router.push("/clientes")}
          className="mt-4 bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50"
          variant="outline"
        >
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ClientDetailsHeader
        client={client}
        editing={false}
        loading={loading}
        onEditClick={() => setShowEditDialog(true)}
        onDeleteClick={() => setShowDeleteDialog(true)}
        onWhatsAppClick={openWhatsApp}
        onSave={() => {}}
        onCancel={() => {}}
      />

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ClientPersonalInfo client={client} age={age} />
          <ClientContactInfo client={client} />
        </div>
        <ClientAdditionalInfo client={client} />
        <ClientSalesHistory sales={sales} />
      </div>

      <DeleteClientDetailsDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        client={client}
        onConfirm={handleDelete}
        loading={loading}
      />

      <ClientUpsertDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        client={client}
        onSaved={() => void clientQuery.refetch()}
      />
    </div>
  );
}
