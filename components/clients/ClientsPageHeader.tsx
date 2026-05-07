"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function ClientsPageHeader({
  onNewClient,
}: {
  onNewClient?: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Clientes
        </h1>
        <p className="mt-1 text-sm text-zinc-600">Gestión de clientes</p>
      </div>
      <Button 
        onClick={onNewClient} 
        variant="default"
        className="bg-blue-600 text-white border border-blue-600 hover:bg-blue-700"
      >
        <Plus className="mr-2 h-4 w-4" />
        Nuevo Cliente
      </Button>
    </div>
  );
}

