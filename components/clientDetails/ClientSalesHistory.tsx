"use client";

import { ShoppingBag } from "lucide-react";
import SaleCard from "./SaleCard";
import { Sale } from "@/app/sales/actions";
import { formatCurrency } from "@/lib/currency-utils";

interface ClientSalesHistoryProps {
  sales: Sale[];
}

export default function ClientSalesHistory({ sales }: ClientSalesHistoryProps) {
  const totalPurchases = sales.length;
  const totalAmount = sales.reduce((sum, sale) => sum + sale.total_amount, 0);

  return (
    <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-black">
          <ShoppingBag className="h-5 w-5 text-black" />
          Historial de Compras
        </h2>
        {totalPurchases > 0 && (
          <div className="text-sm text-zinc-600">
            Total: {totalPurchases} {totalPurchases === 1 ? "compra" : "compras"} - {formatCurrency(totalAmount)}
          </div>
        )}
      </div>

      {sales.length === 0 ? (
        <div className="text-center py-8 text-zinc-600">
          <ShoppingBag className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
          <p>Este cliente aún no ha realizado compras</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sales.map((sale) => (
            <SaleCard
              key={sale.id}
              sale={sale}
            />
          ))}
        </div>
      )}
    </div>
  );
}

