"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import FormattedDate from "@/components/FormattedDate";
import { formatCIN, formatPhone } from "@/lib/client-utils";
import { Client } from "@/app/clientes/actions";

interface ClientTableRowProps {
  cliente: Client;
  onDeleteClick: (cliente: Client) => void;
}

export default function ClientTableRow({ cliente, onDeleteClick }: ClientTableRowProps) {
  const router = useRouter();

  return (
    <tr
      key={cliente.id}
      className="hover:bg-zinc-50 cursor-pointer"
      onClick={() => router.push(`/clientes/${cliente.id}`)}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-zinc-900">
          {cliente.name}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-zinc-600">{formatCIN(cliente.cin)}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-zinc-600">
          {formatPhone(cliente.phone)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-zinc-600">
          {cliente.email || "-"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-zinc-600">
          {cliente.birth_date ? (
            <FormattedDate date={cliente.birth_date} format="date" />
          ) : (
            "-"
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-zinc-600">
          <FormattedDate date={cliente.created_at} format="date" />
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-white border-black text-black hover:bg-zinc-50"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/clientes/${cliente.id}`);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteClick(cliente);
            }}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

