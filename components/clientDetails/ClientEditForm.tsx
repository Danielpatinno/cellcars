"use client";

import { Input } from "@/components/ui/input";
import { formatCIN, formatPhone, unformatCIN, unformatPhone } from "@/lib/client-utils";

interface ClientEditFormProps {
  formData: {
    name: string;
    cin: string;
    phone: string;
    email: string;
    address: string;
    birth_date: string;
  };
  cinDisplay: string;
  phoneDisplay: string;
  onFormDataChange: (data: Partial<ClientEditFormProps["formData"]>) => void;
  onCinDisplayChange: (value: string) => void;
  onPhoneDisplayChange: (value: string) => void;
}

export default function ClientEditForm({
  formData,
  cinDisplay,
  phoneDisplay,
  onFormDataChange,
  onCinDisplayChange,
  onPhoneDisplayChange,
}: ClientEditFormProps) {
  const handleCinChange = (value: string) => {
    const formatted = formatCIN(value);
    onCinDisplayChange(formatted);
    onFormDataChange({ cin: unformatCIN(formatted) });
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    onPhoneDisplayChange(formatted);
    onFormDataChange({ phone: unformatPhone(formatted) });
  };

  return (
    <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4 text-black">Editar Información</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-500">
            Nombre Completo *
          </label>
          <Input
            required
            value={formData.name}
            onChange={(e) =>
              onFormDataChange({ name: e.target.value })
            }
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-500">
            C.I.N *
          </label>
          <Input
            required
            value={cinDisplay}
            onChange={(e) => handleCinChange(e.target.value)}
            placeholder="0.000.000"
            maxLength={12}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-500">
            Teléfono *
          </label>
          <Input
            required
            value={phoneDisplay}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="0986 381-491"
            maxLength={14}
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
              onFormDataChange({ email: e.target.value })
            }
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-500">
            Dirección
          </label>
          <Input
            value={formData.address}
            onChange={(e) =>
              onFormDataChange({ address: e.target.value })
            }
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
              onFormDataChange({ birth_date: e.target.value })
            }
          />
        </div>
      </div>
    </div>
  );
}

