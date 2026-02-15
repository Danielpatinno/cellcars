"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { toast } from "sonner";
import { getClients, deleteClient, Client } from "./actions";
import ClientsPageHeader from "@/components/clients/ClientsPageHeader";
import ClientsSearchBar from "@/components/clients/ClientsSearchBar";
import ClientsTable from "@/components/clients/ClientsTable";
import ClientsEmptyState from "@/components/clients/ClientsEmptyState";
import DeleteClientDialog from "@/components/clients/DeleteClientDialog";

function ClientesPageContent() {
  const [clientes, setClientes] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    setLoading(true);
    try {
      const data = await getClients();
      setClientes(data);
    } catch (error) {
      console.error("Error loading clients:", error);
    } finally {
      setLoading(false);
    }
  };

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

    setLoading(true);
    try {
      const result = await deleteClient(clientToDelete.id);
      if (result.success) {
        toast.success("Cliente eliminado exitosamente");
        setShowDeleteDialog(false);
        setClientToDelete(null);
        loadClientes();
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

  return (
    <div className="p-8">
      <ClientsPageHeader />

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
        />
      )}

      <DeleteClientDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        client={clientToDelete}
        onConfirm={handleDelete}
        loading={loading}
      />
    </div>
  );
}

export default function ClientesPage() {
  return (
    <Suspense fallback={<div className="p-8"><p className="text-zinc-600">Cargando...</p></div>}>
      <ClientesPageContent />
    </Suspense>
  );
}
