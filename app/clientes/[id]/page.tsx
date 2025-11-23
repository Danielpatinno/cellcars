"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Edit, Save, X, Trash2, User, Phone, Mail, MapPin, Calendar, CreditCard, ShoppingBag } from "lucide-react";
import {
  getClientById,
  updateClient,
  deleteClient,
  Client,
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
import { getSales, Sale } from "@/app/sales/actions";

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

  const calculateAge = (birthDate: string | null): number | null => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
    }).format(value / 100);
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
        setEditing(false);
        loadClient();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error updating client:", error);
      alert("Error al actualizar cliente");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const result = await deleteClient(id);
      if (result.success) {
        router.push("/clientes");
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
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" onClick={() => router.push("/clientes")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-zinc-900">
            {editing ? "Editar Cliente" : "Detalles del Cliente"}
          </h1>
        </div>
        {!editing ? (
          <div className="flex gap-2">
            <Button onClick={() => setEditing(true)} variant="outline" className="bg-white border-black text-black hover:bg-zinc-50">
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={loading} variant="outline" className="bg-white border-black text-black hover:bg-zinc-50">
              <Save className="mr-2 h-4 w-4" />
              Guardar
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setEditing(false);
                loadClient();
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-black">Editar Información</h2>
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
        </div>
      ) : (
        <div className="space-y-6">
          {/* Información Personal e Contacto lado a lado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información Personal */}
            <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-black">
                <User className="h-5 w-5 text-black" />
                Información Personal
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-black flex items-center gap-2 mb-1">
                    <User className="h-4 w-4" />
                    Nombre Completo
                  </label>
                  <p className="text-lg text-zinc-900 font-medium">{client.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-black flex items-center gap-2 mb-1">
                    <CreditCard className="h-4 w-4" />
                    C.I.N
                  </label>
                  <p className="text-lg text-zinc-900">{client.cin}</p>
                </div>
                {age !== null && (
                  <div>
                    <label className="text-sm font-medium text-black flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4" />
                      Edad
                    </label>
                    <p className="text-lg text-zinc-900">{age} años</p>
                  </div>
                )}
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-black">
                <Phone className="h-5 w-5 text-black" />
                Información de Contacto
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-black flex items-center gap-2 mb-1">
                    <Phone className="h-4 w-4" />
                    Teléfono
                  </label>
                  <p className="text-lg text-zinc-900">{client.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-black flex items-center gap-2 mb-1">
                    <Mail className="h-4 w-4" />
                    Correo Electrónico
                  </label>
                  <p className="text-lg text-zinc-900">
                    {client.email || "-"}
                  </p>
                </div>
                {client.address && (
                  <div>
                    <label className="text-sm font-medium text-black flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4" />
                      Dirección
                    </label>
                    <p className="text-lg text-zinc-900">{client.address}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Información Adicional */}
          <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-black">
              <Calendar className="h-5 w-5 text-black" />
              Información Adicional
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {client.birth_date && (
                <div>
                  <label className="text-sm font-medium text-black mb-1 block">
                    Fecha de Nacimiento
                  </label>
                  <p className="text-lg text-zinc-900">
                    <FormattedDate date={client.birth_date} format="date" />
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-black mb-1 block">
                  Fecha de Registro
                </label>
                <p className="text-lg text-zinc-900">
                  <FormattedDate date={client.created_at} format="date" />
                </p>
              </div>
            </div>
          </div>

          {/* Historial de Compras */}
          <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-black">
                <ShoppingBag className="h-5 w-5 text-black" />
                Historial de Compras
              </h2>
              {totalPurchases > 0 && (
                <div className="text-sm text-zinc-600">
                  Total: {totalPurchases} {totalPurchases === 1 ? "compra" : "compras"} - {formatCurrency(totalAmount)}
                </div>
              )}
            </div>

            {sales.length === 0 ? (
              <div className="text-center py-8 text-zinc-600">
                <ShoppingBag className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
                <p>Este cliente aún no ha realizado compras</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sales.map((sale) => (
                  <div
                    key={sale.id}
                    className="border border-zinc-200 rounded-lg p-4 hover:bg-zinc-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/sales/${sale.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-zinc-900">
                            {sale.vehicle
                              ? `${sale.vehicle.brand} ${sale.vehicle.model} ${sale.vehicle.year}`
                              : "Vehículo no encontrado"}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              sale.status === "completado"
                                ? "bg-green-100 text-green-800"
                                : sale.status === "pendiente"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {sale.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-black">Fecha:</span>
                            <p className="text-zinc-900 font-medium">
                              <FormattedDate date={sale.sale_date} format="date" />
                            </p>
                          </div>
                          <div>
                            <span className="text-black">Monto:</span>
                            <p className="text-zinc-900 font-medium">
                              {formatCurrency(sale.total_amount)}
                            </p>
                          </div>
                          <div>
                            <span className="text-black">Método:</span>
                            <p className="text-zinc-900 font-medium">
                              {sale.payment_method}
                            </p>
                          </div>
                          {sale.vehicle && (
                            <div>
                              <span className="text-black">Placa:</span>
                              <p className="text-zinc-900 font-medium">
                                {sale.vehicle.plate}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/sales/${sale.id}`);
                        }}
                      >
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              <strong>{client.name}</strong>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
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
