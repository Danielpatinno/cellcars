"use client";

import { TableLoading } from "@/components/ui/table-loading";
import ClientTableRow from "./ClientTableRow";
import { Client } from "@/app/clientes/actions";

interface ClientsTableProps {
  clients: Client[];
  loading: boolean;
  onDeleteClick: (cliente: Client) => void;
  onEditClick?: (cliente: Client) => void;
}

export default function ClientsTable({ clients, loading, onDeleteClick, onEditClick }: ClientsTableProps) {
  if (loading && !clients.length) {
    return (
      <div className="bg-white/80 backdrop-blur rounded-2xl border border-zinc-200/70 overflow-hidden shadow-sm">
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
              <TableLoading colSpan={7} message="Cargando clientes..." />
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl border border-zinc-200/70 overflow-hidden shadow-sm">
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
            {clients.map((cliente) => (
              <ClientTableRow
                key={cliente.id}
                cliente={cliente}
                onDeleteClick={onDeleteClick}
                onEditClick={onEditClick}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

