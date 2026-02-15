"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, MessageCircle, Save, X } from "lucide-react";
import { Client } from "@/app/clientes/actions";

interface ClientDetailsHeaderProps {
  client: Client;
  editing: boolean;
  loading?: boolean;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onWhatsAppClick: (phone: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function ClientDetailsHeader({
  client,
  editing,
  loading = false,
  onEditClick,
  onDeleteClick,
  onWhatsAppClick,
  onSave,
  onCancel,
}: ClientDetailsHeaderProps) {
  const router = useRouter();

  return (
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
          <Button
            onClick={() => onWhatsAppClick(client.phone)}
            variant="outline"
            className="bg-green-50 border-green-600 text-green-600 hover:bg-green-100"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Enviar Mensaje
          </Button>
          <Button 
            onClick={onEditClick} 
            variant="outline" 
            className="bg-white border-black text-black hover:bg-zinc-50"
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="outline"
            onClick={onDeleteClick}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button 
            onClick={onSave} 
            disabled={loading} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-base shadow-md"
          >
            <Save className="mr-2 h-4 w-4" />
            Guardar
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
          >
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
        </div>
      )}
    </div>
  );
}

