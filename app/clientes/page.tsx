"use client";

import { useMemo, Suspense, useState } from "react";
import { toast } from "sonner";
import { type Client } from "./actions";
import ClientsPageHeader from "@/components/clients/ClientsPageHeader";
import ClientsSearchBar from "@/components/clients/ClientsSearchBar";
import ClientsTable from "@/components/clients/ClientsTable";
import ClientsEmptyState from "@/components/clients/ClientsEmptyState";
import DeleteClientDialog from "@/components/clients/DeleteClientDialog";
import ClientUpsertDialog from "@/components/clients/ClientUpsertDialog";
import { useClients } from "@/hooks/clients/useClients";
import { useDeleteClient } from "@/hooks/clients/useClientMutations";

function ClientesPageContent() {
  const clientsQuery = useClients();
  const deleteMutation = useDeleteClient();

  const clientes = clientsQuery.data ?? [];
  const loading = clientsQuery.isLoading || deleteMutation.isPending;
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [showUpsertDialog, setShowUpsertDialog] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  const filteredClients = useMemo(() => {
    if (!searchTerm) return clientes;
    const term = searchTerm.toLowerCase();
    return clientes.filter(
      (cliente) =>
        cliente.name.toLowerCase().includes(term) ||
        cliente.cin.toLowerCase().includes(term) ||
        cliente.phone.toLowerCase().includes(term) ||
        (cliente.email && cliente.email.toLowerCase().includes(term))
    );
  }, [clientes, searchTerm]);


  const handleDeleteClick = (cliente: Client) => {
    setClientToDelete(cliente);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!clientToDelete) return;

    try {
      await deleteMutation.mutateAsync(clientToDelete.id);
      toast.success("Cliente eliminado exitosamente");
      setShowDeleteDialog(false);
      setClientToDelete(null);
    } catch (error: any) {
      toast.error("Error al eliminar cliente: " + (error.message || "Error desconocido"));
    }
  };

  const handleNewClient = () => {
    setClientToEdit(null);
    setShowUpsertDialog(true);
  };

  const handleEditClient = (cliente: Client) => {
    setClientToEdit(cliente);
    setShowUpsertDialog(true);
  };

  return (
    <div className="space-y-6">
      <ClientsPageHeader onNewClient={handleNewClient} />

      <ClientsSearchBar 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
      />

      {filteredClients.length === 0 && !loading ? (
        <ClientsEmptyState searchTerm={searchTerm} />
      ) : (
        <ClientsTable 
          clients={filteredClients} 
          loading={loading} 
          onDeleteClick={handleDeleteClick}
          onEditClick={handleEditClient}
        />
      )}

      <DeleteClientDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        client={clientToDelete}
        onConfirm={handleDelete}
        loading={loading}
      />

      <ClientUpsertDialog
        open={showUpsertDialog}
        onOpenChange={setShowUpsertDialog}
        client={clientToEdit}
        onSaved={() => {}}
      />
    </div>
  );
}

export default function ClientesPage() {
  return (
    <Suspense fallback={<div><p className="text-zinc-600">Cargando...</p></div>}>
      <ClientesPageContent />
    </Suspense>
  );
}
