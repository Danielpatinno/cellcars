"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Car, X, Image as ImageIcon, Upload, Loader2, ArrowLeft } from "lucide-react";
import { createVehicle } from "../actions";
import { CurrencyInput } from "@/components/ui/currency-input";
import { toast } from "sonner";
import { compressImages } from "@/lib/image-compression";

export default function NewVehiclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
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
  const [imagensFiles, setImagensFiles] = useState<File[]>([]);
  const [imagensPreview, setImagensPreview] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, year: new Date().getFullYear() }));
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 6 - imagensPreview.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    filesToAdd.forEach((file) => {
      if (file.type.startsWith("image/")) {
        setImagensFiles((prev) => [...prev, file]);
        
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setImagensPreview((prev) => [...prev, result]);
        };
        reader.readAsDataURL(file);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImagensPreview((prev) => prev.filter((_, i) => i !== index));
    setImagensFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateProfitMargin = () => {
    if (formData.cost_price === 0) return 0;
    const profit = formData.price - formData.cost_price;
    return ((profit / formData.cost_price) * 100).toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Comprimir imagens antes de enviar
      let imagesToUpload = imagensFiles;
      if (imagensFiles.length > 0) {
        try {
          toast.info("Comprimiendo imágenes...");
          imagesToUpload = await compressImages(imagensFiles, 1920, 1920, 0.8);
        } catch (compressError) {
          console.error("Error comprimiendo imágenes:", compressError);
          toast.warning("Error al comprimir algunas imágenes, intentando subir originales...");
          // Continuar com imagens originais se compressão falhar
        }
      }
      
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
        images: imagesToUpload,
      });

      if (result.success) {
        toast.success("Vehículo creado exitosamente");
        router.push(`/vehicles/${result.vehicle.id}`);
      } else {
        toast.error(result.message || "Error al crear vehículo");
      }
    } catch (error: any) {
      console.error("Error creating vehicle:", error);
      toast.error("Error al crear vehículo: " + (error.message || "Error desconocido"));
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
            onClick={() => router.push("/vehicles")}
            className="bg-white border-black text-black hover:bg-zinc-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="mb-2 text-4xl font-bold text-zinc-900 flex items-center gap-2">
              Registrar Nuevo Vehículo <Car className="h-8 w-8" />
            </h1>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-md border border-zinc-200">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-500">
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
              <label className="mb-1 block text-sm font-medium text-zinc-500">
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
              <label className="mb-1 block text-sm font-medium text-zinc-500">
                Año *
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
              <label className="mb-1 block text-sm font-medium text-zinc-500">
                Color *
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
              <label className="mb-1 block text-sm font-medium text-zinc-500">
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
              <label className="mb-1 block text-sm font-medium text-zinc-500">
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
                <label className="mb-1 block text-sm font-medium text-zinc-500">
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
              <label className="mb-1 block text-sm font-medium text-zinc-500">
                Chapa
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
              <label className="mb-1 block text-sm font-medium text-zinc-500">
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
              <label className="mb-1 block text-sm font-medium text-zinc-500">
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
              <label className="mb-2 block text-sm font-medium text-zinc-500">
                Imágenes del Vehículo (máximo 6)
              </label>
              <div className="space-y-4">
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

            <div className="sm:col-span-2 lg:col-span-3 flex items-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/vehicles")}
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
                  "Registrar Vehículo"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

