"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Car, X, Image as ImageIcon, Upload, Loader2, Search, Eye } from "lucide-react";
import { createVehicle, getVehicles, Vehicle } from "./actions";
import { CurrencyInput } from "@/components/ui/currency-input";

interface VehicleWithImages extends Vehicle {
  images?: string[];
}

export default function VeiculosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [veiculos, setVeiculos] = useState<VehicleWithImages[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: 0,
    color: "",
    cost_price: 0,
    price: 0,
    plate: "",
    mileage: 0,
    status: "disponible",
  });
  const [imagensFiles, setImagensFiles] = useState<File[]>([]);
  const [imagensPreview, setImagensPreview] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 6 - imagensPreview.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    filesToAdd.forEach((file) => {
      if (file.type.startsWith("image/")) {
        // Adicionar arquivo original
        setImagensFiles((prev) => [...prev, file]);
        
        // Criar preview
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setImagensPreview((prev) => [...prev, result]);
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImagensPreview((prev) => prev.filter((_, i) => i !== index));
    setImagensFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await createVehicle({
        brand: formData.brand,
        model: formData.model,
        year: formData.year,
        color: formData.color,
        cost_price: formData.cost_price,
        price: formData.price,
        plate: formData.plate,
        mileage: formData.mileage,
        status: formData.status,
        images: imagensFiles,
      });

      if (result.success) {
        // Recarregar veículos
        const vehicles = await getVehicles();
        setVeiculos(vehicles as VehicleWithImages[]);
        setFormData({
          brand: "",
          model: "",
          year: new Date().getFullYear(),
          color: "",
          cost_price: 0,
          price: 0,
          plate: "",
          mileage: 0,
          status: "disponible",
        });
        setFormData((prev) => ({ ...prev, year: new Date().getFullYear() }));
        setImagensPreview([]);
        setImagensFiles([]);
        setShowForm(false);
      }
    } catch (error) {
      console.error("Error creating vehicle:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "disponible":
        return "bg-green-100 text-green-800";
      case "vendido":
        return "bg-gray-100 text-gray-800";
      case "reservado":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case "disponible":
        return "Disponible";
      case "vendido":
        return "Vendido";
      case "reservado":
        return "Reservado";
      default:
        return status || "N/A";
    }
  };

  useEffect(() => {
    // Inicializar year com data atual
    setFormData((prev) => ({ ...prev, year: new Date().getFullYear() }));
    
    const loadVehicles = async () => {
      setLoading(true);
      try {
        const vehicles = await getVehicles();
        setVeiculos(vehicles as VehicleWithImages[]);
      } catch (error) {
        console.error("Error loading vehicles:", error);
      } finally {
        setLoading(false);
      }
    };
    loadVehicles();
    
    // Verificar se deve abrir o formulário
    if (searchParams.get("new") === "true") {
      setShowForm(true);
    }
  }, [searchParams]);

  const filteredVehicles = useMemo(() => {
    if (!searchTerm) return veiculos;
    const term = searchTerm.toLowerCase();
    return veiculos.filter(
      (veiculo) =>
        veiculo.brand.toLowerCase().includes(term) ||
        veiculo.model.toLowerCase().includes(term) ||
        veiculo.plate.toLowerCase().includes(term) ||
        veiculo.color?.toLowerCase().includes(term)
    );
  }, [veiculos, searchTerm]);

  const calculateProfitMargin = () => {
    if (formData.cost_price === 0) return 0;
    const profit = formData.price - formData.cost_price;
    return ((profit / formData.cost_price) * 100).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-zinc-900 flex items-center gap-2">
              Vehículos <Car className="h-8 w-8" />
            </h1>
            <p className="text-lg text-zinc-600">
              Gestione su inventario de vehículos para venta
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            variant="outline"
            className="bg-white border-black text-black hover:bg-zinc-50"
          >
            {showForm ? "Cancelar" : "+ Agregar Vehículo"}
          </Button>
        </div>

        {/* Formulário de Cadastro */}
        {showForm && (
          <div className="mb-8 rounded-xl bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold text-black">
              Registrar Nuevo Vehículo
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Marca *
                </label>
                <input
                  type="text"
                  required
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900"
                  placeholder="Ex: Toyota"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Modelo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900"
                  placeholder="Ex: Corolla"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Ano *
                </label>
                <input
                  type="number"
                  required
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Cor *
                </label>
                <input
                  type="text"
                  required
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900"
                  placeholder="Ej: Blanco"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Precio de Costo *
                </label>
                <CurrencyInput
                  value={formData.cost_price}
                  onChange={(value) =>
                    setFormData({ ...formData, cost_price: value })
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Precio de Venta *
                </label>
                <CurrencyInput
                  value={formData.price}
                  onChange={(value) =>
                    setFormData({ ...formData, price: value })
                  }
                />
              </div>
              {formData.cost_price > 0 && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-black">
                    Margen de Lucro
                  </label>
                  <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="text-blue-900 font-semibold">
                      {calculateProfitMargin()}%
                    </span>
                  </div>
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Placa
                </label>
                <input
                  type="text"
                  value={formData.plate}
                  onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900"
                  placeholder="ABC-1234"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Kilometraje
                </label>
                <input
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) })}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900"
                >
                  <option value="disponible">Disponible</option>
                  <option value="reservado">Reservado</option>
                  <option value="vendido">Vendido</option>
                </select>
              </div>
              
              {/* Upload de Imagens */}
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="mb-2 block text-sm font-medium text-black">
                  Imágenes del Vehículo (máximo 6)
                </label>
                <div className="space-y-4">
                  {/* Botão de Upload */}
                  {imagensPreview.length < 6 && (
                    <div className="flex items-center gap-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex items-center gap-2"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4" />
                          Agregar Imágenes ({imagensPreview.length}/6)
                        </Button>
                      </label>
                      <p className="text-sm text-zinc-500">
                        Puede agregar hasta {6 - imagensPreview.length} imagen(es) más
                      </p>
                    </div>
                  )}

                  {/* Preview das Imagens */}
                  {imagensPreview.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                      {imagensPreview.map((imagem, index) => (
                        <div
                          key={index}
                          className="group relative aspect-square overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50"
                        >
                          <img
                            src={imagem}
                            alt={`Preview ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                            aria-label="Remover imagem"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 text-center text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                            Imagen {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {imagensPreview.length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
                      <ImageIcon className="mb-2 h-12 w-12 text-zinc-400" />
                      <p className="text-sm text-zinc-500">
                        No hay imágenes agregadas
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">
                        Haga clic en "Agregar Imágenes" para comenzar
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2 lg:col-span-3 flex items-end">
                <Button
                  type="submit"
                  variant="default"
                  className="w-full"
                >
                  Registrar Vehículo
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Barra de búsqueda */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <Input
              type="text"
              placeholder="Buscar por marca, modelo, placa o color..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de Veículos */}
        <div className="rounded-xl bg-white shadow-md">
          <div className="border-b border-zinc-200 p-6">
            <h2 className="text-xl font-semibold text-black">
              Lista de Vehículos ({filteredVehicles.length})
            </h2>
          </div>
          {filteredVehicles.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-lg text-zinc-500">
                {searchTerm
                  ? "No se encontraron vehículos con el término de búsqueda"
                  : "Ningún vehículo registrado aún."}
              </p>
              {!searchTerm && (
                <p className="mt-2 text-sm text-zinc-400">
                  Haga clic en "Agregar Vehículo" para comenzar.
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                      Imagen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                      Marca/Modelo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                      Año
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                      Color
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                      Precio Costo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                      Precio Venta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                      Margen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                      Placa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white">
                  {filteredVehicles.map((veiculo) => {
                    const profitMargin = veiculo.cost_price > 0
                      ? (((veiculo.price - veiculo.cost_price) / veiculo.cost_price) * 100).toFixed(2)
                      : "0.00";
                    return (
                    <tr
                      key={veiculo.id}
                      className="hover:bg-zinc-50 cursor-pointer"
                      onClick={() => router.push(`/vehicles/${veiculo.id}`)}
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        {veiculo.images && veiculo.images.length > 0 ? (
                          <div className="h-16 w-16 overflow-hidden rounded-lg border border-zinc-200">
                            <img
                              src={veiculo.images[0]}
                              alt={`${veiculo.brand} ${veiculo.model}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-100">
                            <ImageIcon className="h-6 w-6 text-zinc-400" />
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="font-medium text-zinc-900">
                          {veiculo.brand} {veiculo.model}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-zinc-500">
                        {veiculo.year}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-zinc-500">
                        {veiculo.color || "N/A"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-zinc-600">
                        ${((veiculo.cost_price || 0) / 100).toFixed(2).replace(".", ",")}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-zinc-900">
                        ${((veiculo.price || 0) / 100).toFixed(2).replace(".", ",")}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-blue-600 font-semibold">
                        {profitMargin}%
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-zinc-500">
                        {veiculo.plate}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(veiculo.status)}`}
                        >
                          {getStatusLabel(veiculo.status)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/vehicles/${veiculo.id}`);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

