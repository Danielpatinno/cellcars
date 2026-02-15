"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getClientById, updateClient, deleteClient, Client } from "../actions";
import { getSales, Sale } from "@/app/sales/actions";
import ClientDetailsHeader from "@/components/clientDetails/ClientDetailsHeader";
import ClientEditForm from "@/components/clientDetails/ClientEditForm";
import ClientPersonalInfo from "@/components/clientDetails/ClientPersonalInfo";
import ClientContactInfo from "@/components/clientDetails/ClientContactInfo";
import ClientAdditionalInfo from "@/components/clientDetails/ClientAdditionalInfo";
import ClientSalesHistory from "@/components/clientDetails/ClientSalesHistory";
import DeleteClientDetailsDialog from "@/components/clientDetails/DeleteClientDetailsDialog";
import { formatCIN, formatPhone } from "@/lib/client-utils";
import { calculateAge } from "@/lib/date-utils";
import { useWhatsApp } from "@/hooks/useWhatsApp";

export default function ClientDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  const [client, setClient] = useState<Client | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    cin: "",
    phone: "",
    email: "",
    address: "",
    birth_date: "",
  });
  const [cinDisplay, setCinDisplay] = useState("");
  const [phoneDisplay, setPhoneDisplay] = useState("");
  const { openWhatsApp } = useWhatsApp();

  useEffect(() => {
    loadClient();
    loadSales();
  }, [id]);

  const loadClient = async () => {
    setLoading(true);
    try {
      const data = await getClientById(id);
      if (data) {
        setClient(data);
        setFormData({
          name: data.name,
          cin: data.cin,
          phone: data.phone,
          email: data.email || "",
          address: data.address || "",
          birth_date: data.birth_date ? data.birth_date.split("T")[0] : "",
        });
        setCinDisplay(formatCIN(data.cin));
        setPhoneDisplay(formatPhone(data.phone));
      }
    } catch (error) {
      console.error("Error loading client:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSales = async () => {
    try {
      const allSales = await getSales();
      const clientSales = allSales.filter((sale) => sale.client_id === id);
      setSales(clientSales);
    } catch (error) {
      console.error("Error loading sales:", error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await updateClient(id, {
        name: formData.name,
        cin: formData.cin,
        phone: formData.phone,
        email: formData.email || undefined,
        address: formData.address || undefined,
        birth_date: formData.birth_date || undefined,
      });

      if (result.success) {
        toast.success("Cliente actualizado exitosamente");
        setEditing(false);
        loadClient();
      } else {
        toast.error(result.message || "Error al actualizar cliente");
      }
    } catch (error: any) {
      console.error("Error updating client:", error);
      toast.error("Error al actualizar cliente: " + (error.message || "Error desconocido"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const result = await deleteClient(id);
      if (result.success) {
        toast.success("Cliente eliminado exitosamente");
        router.push("/clientes");
      } else {
        toast.error(result.message || "Error al eliminar cliente");
      }
    } catch (error: any) {
      console.error("Error deleting client:", error);
      toast.error("Error al eliminar cliente: " + (error.message || "Error desconocido"));
    } finally {
      setLoading(false);
    }
  };

  if (loading && !client) {
    return (
      <div className="p-8">
        <p className="text-zinc-600">Cargando...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-8">
        <p className="text-zinc-600">Cliente no encontrado</p>
        <Button onClick={() => router.push("/clientes")} className="mt-4">
          Volver
        </Button>
      </div>
    );
  }

  const age = calculateAge(client.birth_date);
  const totalPurchases = sales.length;
  const totalAmount = sales.reduce((sum, sale) => sum + sale.total_amount, 0);

  return (
    <div className="p-8">
      <ClientDetailsHeader
        client={client}
        editing={editing}
        loading={loading}
        onEditClick={() => setEditing(true)}
        onDeleteClick={() => setShowDeleteDialog(true)}
        onWhatsAppClick={openWhatsApp}
        onSave={handleSave}
        onCancel={() => {
          setEditing(false);
          loadClient();
        }}
      />

      {editing ? (
        <ClientEditForm
          formData={formData}
          cinDisplay={cinDisplay}
          phoneDisplay={phoneDisplay}
          onFormDataChange={(data) => setFormData({ ...formData, ...data })}
          onCinDisplayChange={setCinDisplay}
          onPhoneDisplayChange={setPhoneDisplay}
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ClientPersonalInfo client={client} age={age} />
            <ClientContactInfo client={client} />
          </div>
          <ClientAdditionalInfo client={client} />
          <ClientSalesHistory sales={sales} />
        </div>
      )}

      <DeleteClientDetailsDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        client={client}
        onConfirm={handleDelete}
        loading={loading}
      />
    </div>
  );
}
