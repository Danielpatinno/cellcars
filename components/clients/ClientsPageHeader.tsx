"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function ClientsPageHeader() {
  const router = useRouter();

  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Clientes</h1>
        <p className="text-zinc-600 mt-1">Gestión de clientes</p>
      </div>
      <Button 
        onClick={() => router.push("/clientes/new")} 
        variant="outline" 
        className="bg-white border-black text-black hover:bg-zinc-50"
      >
        <Plus className="mr-2 h-4 w-4" />
        Nuevo Cliente
      </Button>
    </div>
  );
}

