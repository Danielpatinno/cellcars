"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, Search, Edit, Trash2 } from "lucide-react";
import {
  createClient,
  getClients,
  deleteClient,
  Client,
} from "./actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FormattedDate from "@/components/FormattedDate";

function ClientesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [clientes, setClientes] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    cin: "",
    phone: "",
    email: "",
    address: "",
    birth_date: "",
  });

  useEffect(() => {
    loadClientes();
    
    // Verificar se deve abrir o formulário
    if (searchParams.get("new") === "true") {
      setShowForm(true);
    }
  }, [searchParams]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createClient({
        name: formData.name,
        cin: formData.cin,
        phone: formData.phone,
        email: formData.email || undefined,
        address: formData.address || undefined,
        birth_date: formData.birth_date || undefined,
      });

      if (result.success) {
        setShowForm(false);
        setFormData({
          name: "",
          cin: "",
          phone: "",
          email: "",
          address: "",
          birth_date: "",
        });
        loadClientes();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error creating client:", error);
      alert("Error al crear cliente");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!clientToDelete) return;

    setLoading(true);
    try {
      const result = await deleteClient(clientToDelete.id);
      if (result.success) {
        setShowDeleteDialog(false);
        setClientToDelete(null);
        loadClientes();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      alert("Error al eliminar cliente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Clientes</h1>
          <p className="text-zinc-600 mt-1">Gestión de clientes</p>
        </div>
        <Button onClick={() => setShowForm(true)} variant="outline" className="bg-white border-black text-black hover:bg-zinc-50">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre, C.I.N, teléfono o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="mb-6 bg-white border border-zinc-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-black">Nuevo Cliente</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Nombre Completo *
                </label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  C.I.N *
                </label>
                <Input
                  required
                  value={formData.cin}
                  onChange={(e) =>
                    setFormData({ ...formData, cin: e.target.value })
                  }
                  placeholder="Cédula de Identidad"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Teléfono *
                </label>
                <Input
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="Teléfono"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Correo Electrónico
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Dirección
                </label>
                <Input
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Dirección"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Fecha de Nacimiento
                </label>
                <Input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) =>
                    setFormData({ ...formData, birth_date: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                Guardar Cliente
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    name: "",
                    cin: "",
                    phone: "",
                    email: "",
                    address: "",
                    birth_date: "",
                  });
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de clientes */}
      {loading && !clientes.length ? (
        <div className="text-center py-12">
          <p className="text-zinc-600">Cargando clientes...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-zinc-200">
          <Users className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
          <p className="text-zinc-600">
            {searchTerm
              ? "No se encontraron clientes con el término de búsqueda"
              : "No hay clientes registrados"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    C.I.N
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Correo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Fecha Nac.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Registrado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-zinc-700 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-zinc-200">
                {filteredClients.map((cliente) => (
                  <tr
                    key={cliente.id}
                    className="hover:bg-zinc-50 cursor-pointer"
                    onClick={() => router.push(`/clientes/${cliente.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-zinc-900">
                        {cliente.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-zinc-600">{cliente.cin}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-zinc-600">
                        {cliente.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-zinc-600">
                        {cliente.email || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-zinc-600">
                        {cliente.birth_date ? (
                          <FormattedDate date={cliente.birth_date} format="date" />
                        ) : (
                          "-"
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-zinc-600">
                        <FormattedDate date={cliente.created_at} format="date" />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white border-black text-black hover:bg-zinc-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/clientes/${cliente.id}`);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setClientToDelete(cliente);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
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

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar al cliente{" "}
              <strong>{clientToDelete?.name}</strong>? Esta acción no se puede
              deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setClientToDelete(null);
              }}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
