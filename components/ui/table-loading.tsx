import { Loader2 } from "lucide-react";

interface TableLoadingProps {
  colSpan: number;
  message?: string;
}

export function TableLoading({ colSpan, message = "Cargando..." }: TableLoadingProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-12 text-center">
        <div className="flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          <p className="text-sm text-zinc-600">{message}</p>
        </div>
      </td>
    </tr>
  );
}

