"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import FormattedDate from "@/components/FormattedDate";
import { Sale } from "@/app/sales/actions";
import { formatCurrency } from "@/lib/currency-utils";

interface SaleCardProps {
  sale: Sale;
}

export default function SaleCard({ sale }: SaleCardProps) {
  const router = useRouter();

  return (
    <div
      className="border border-zinc-200 rounded-lg p-4 hover:bg-zinc-50 transition-colors cursor-pointer"
      onClick={() => router.push(`/sales/${sale.id}`)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-zinc-900">
              {sale.vehicle
                ? `${sale.vehicle.brand} ${sale.vehicle.model} ${sale.vehicle.year}`
                : "Vehículo no encontrado"}
            </h3>
            <span
              className={`px-2 py-1 text-xs font-medium rounded ${
                sale.status === "completado"
                  ? "bg-green-100 text-green-800"
                  : sale.status === "pendiente"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {sale.status}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-black">Fecha:</span>
              <p className="text-zinc-900 font-medium">
                <FormattedDate date={sale.sale_date} format="date" />
              </p>
            </div>
            <div>
              <span className="text-black">Monto:</span>
              <p className="text-zinc-900 font-medium">
                {formatCurrency(sale.total_amount)}
              </p>
            </div>
            <div>
              <span className="text-black">Método:</span>
              <p className="text-zinc-900 font-medium">
                {sale.payment_method}
              </p>
            </div>
            {sale.vehicle && (
              <div>
                <span className="text-black">Placa:</span>
                <p className="text-zinc-900 font-medium">
                  {sale.vehicle.plate}
                </p>
              </div>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/sales/${sale.id}`);
          }}
        >
          Ver Detalles
        </Button>
      </div>
    </div>
  );
}

