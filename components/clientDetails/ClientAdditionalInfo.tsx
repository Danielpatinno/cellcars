"use client";

import { Calendar } from "lucide-react";
import FormattedDate from "@/components/FormattedDate";
import { Client } from "@/app/clientes/actions";

interface ClientAdditionalInfoProps {
  client: Client;
}

export default function ClientAdditionalInfo({ client }: ClientAdditionalInfoProps) {
  return (
    <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-black">
        <Calendar className="h-5 w-5 text-black" />
        Información Adicional
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {client.birth_date && (
          <div>
            <label className="text-sm font-medium text-zinc-500 mb-1 block">
              Fecha de Nacimiento
            </label>
            <p className="text-lg text-zinc-900">
              <FormattedDate date={client.birth_date} format="date" />
            </p>
          </div>
        )}
        <div>
          <label className="text-sm font-medium text-zinc-500 mb-1 block">
            Fecha de Registro
          </label>
          <p className="text-lg text-zinc-900">
            <FormattedDate date={client.created_at} format="date" />
          </p>
        </div>
      </div>
    </div>
  );
}

