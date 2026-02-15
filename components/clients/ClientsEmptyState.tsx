"use client";

import { Users } from "lucide-react";

interface ClientsEmptyStateProps {
  searchTerm: string;
}

export default function ClientsEmptyState({ searchTerm }: ClientsEmptyStateProps) {
  return (
    <div className="text-center py-12 bg-white rounded-lg border border-zinc-200">
      <Users className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
      <p className="text-zinc-600">
        {searchTerm
          ? "No se encontraron clientes con el término de búsqueda"
          : "No hay clientes registrados"}
      </p>
    </div>
  );
}

