"use client";

import { Phone, Mail, MapPin } from "lucide-react";
import { formatPhone } from "@/lib/client-utils";
import { Client } from "@/app/clientes/actions";

interface ClientContactInfoProps {
  client: Client;
}

export default function ClientContactInfo({ client }: ClientContactInfoProps) {
  return (
    <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-black">
        <Phone className="h-5 w-5 text-black" />
        Información de Contacto
      </h2>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-zinc-500 flex items-center gap-2 mb-1">
            <Phone className="h-4 w-4" />
            Teléfono
          </label>
          <p className="text-lg text-zinc-900">{formatPhone(client.phone)}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-500 flex items-center gap-2 mb-1">
            <Mail className="h-4 w-4" />
            Correo Electrónico
          </label>
          <p className="text-lg text-zinc-900">
            {client.email || "-"}
          </p>
        </div>
        {client.address && (
          <div>
            <label className="text-sm font-medium text-zinc-500 flex items-center gap-2 mb-1">
              <MapPin className="h-4 w-4" />
              Dirección
            </label>
            <p className="text-lg text-zinc-900">{client.address}</p>
          </div>
        )}
      </div>
    </div>
  );
}

