"use client";

import { User, CreditCard, Calendar } from "lucide-react";
import { formatCIN } from "@/lib/client-utils";
import { Client } from "@/app/clientes/actions";

interface ClientPersonalInfoProps {
  client: Client;
  age: number | null;
}

export default function ClientPersonalInfo({ client, age }: ClientPersonalInfoProps) {
  return (
    <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-black">
        <User className="h-5 w-5 text-black" />
        Información Personal
      </h2>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-zinc-500 flex items-center gap-2 mb-1">
            <User className="h-4 w-4" />
            Nombre Completo
          </label>
          <p className="text-lg text-zinc-900 font-medium">{client.name}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-500 flex items-center gap-2 mb-1">
            <CreditCard className="h-4 w-4" />
            C.I.N
          </label>
          <p className="text-lg text-zinc-900">{formatCIN(client.cin)}</p>
        </div>
        {age !== null && (
          <div>
            <label className="text-sm font-medium text-zinc-500 flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4" />
              Edad
            </label>
            <p className="text-lg text-zinc-900">{age} años</p>
          </div>
        )}
      </div>
    </div>
  );
}

