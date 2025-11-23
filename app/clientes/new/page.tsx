"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, ArrowLeft, Loader2 } from "lucide-react";
import { createClient } from "../actions";
import { toast } from "sonner";

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    cin: "",
    phone: "",
    email: "",
    address: "",
    birth_date: "",
  });
  const [cinDisplay, setCinDisplay] = useState("");
  const [phoneDisplay, setPhoneDisplay] = useState("");

  // Função para formatar C.I.N (agrupa de 3 em 3 com pontos)
  const formatCIN = (value: string) => {
    // Remove tudo exceto números
    const numbers = value.replace(/\D/g, "");
    // Agrupa de 3 em 3 da direita para esquerda
    if (numbers.length <= 3) return numbers;
    const formatted = numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return formatted;
  };

  // Função para remover formatação (salva apenas números no banco)
  const unformatCIN = (value: string) => {
    return value.replace(/\D/g, "");
  };

  // Função para formatar telefone paraguaio (0986 381-491)
  const formatPhone = (value: string) => {
    // Remove tudo exceto números
    const numbers = value.replace(/\D/g, "");
    // Limita a 10 dígitos
    const limited = numbers.slice(0, 10);
    
    if (limited.length <= 4) return limited;
    if (limited.length <= 7) {
      return `${limited.slice(0, 4)} ${limited.slice(4)}`;
    }
    return `${limited.slice(0, 4)} ${limited.slice(4, 7)}-${limited.slice(7)}`;
  };

  // Função para remover formatação do telefone
  const unformatPhone = (value: string) => {
    return value.replace(/\D/g, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createClient({
        name: formData.name,
        cin: formData.cin,
        phone: formData.phone,
        email: formData.email || undefined,
        address: formData.address || undefined,
        birth_date: formData.birth_date || undefined,
      });

      if (result.success) {
        toast.success("Cliente creado exitosamente");
        router.push("/clientes");
      } else {
        toast.error(result.message || "Error al crear cliente");
      }
    } catch (error: any) {
      console.error("Error creating client:", error);
      toast.error("Error al crear cliente: " + (error.message || "Error desconocido"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="p-8">
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/clientes")}
            className="bg-white border-black text-black hover:bg-zinc-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="mb-2 text-4xl font-bold text-zinc-900 flex items-center gap-2">
              Nuevo Cliente <Users className="h-8 w-8" />
            </h1>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-black">Información del Cliente</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-500">
                  Nombre Completo *
                </label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nombre completo"
                  className="border-black text-black focus:border-black focus:ring-0"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-500">
                  C.I.N *
                </label>
                <Input
                  required
                  value={cinDisplay}
                  onChange={(e) => {
                    const formatted = formatCIN(e.target.value);
                    setCinDisplay(formatted);
                    setFormData({ ...formData, cin: unformatCIN(formatted) });
                  }}
                  placeholder="0.000.000"
                  className="border-black text-black focus:border-black focus:ring-0"
                  maxLength={14}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-500">
                  Teléfono *
                </label>
                <Input
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="Teléfono"
                  className="border-black text-black focus:border-black focus:ring-0"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-500">
                  Correo Electrónico
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="correo@ejemplo.com"
                  className="border-black text-black focus:border-black focus:ring-0"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-500">
                  Dirección
                </label>
                <Input
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Dirección"
                  className="border-black text-black focus:border-black focus:ring-0"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-500">
                  Fecha de Nacimiento
                </label>
                <Input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) =>
                    setFormData({ ...formData, birth_date: e.target.value })
                  }
                  className="border-black text-black focus:border-black focus:ring-0"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/clientes")}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-base shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Cliente"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

