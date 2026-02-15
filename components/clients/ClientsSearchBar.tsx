"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ClientsSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export default function ClientsSearchBar({ searchTerm, onSearchChange }: ClientsSearchBarProps) {
  return (
    <div className="mb-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
        <Input
          type="text"
          placeholder="Buscar por nombre, C.I.N, teléfono o correo..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
}

