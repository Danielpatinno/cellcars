"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Camera, Image as ImageIcon, X, Check, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getVehicleById, updateVehicle } from "../../actions";

export default function VehicleUploadPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [vehicle, setVehicle] = useState<any>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Carregar informações do veículo para verificar quantas imagens já tem
  useEffect(() => {
    const loadVehicle = async () => {
      try {
        const data = await getVehicleById(id);
        if (data) {
          setVehicle(data);
          const existingCount = data.images?.length || 0;
          const maxNewImages = 6 - existingCount;
          if (maxNewImages <= 0) {
            toast.error("Este vehículo ya tiene el máximo de 6 imágenes");
            router.push(`/vehicles/${id}`);
          }
        }
      } catch (error) {
        console.error("Error loading vehicle:", error);
      }
    };
    loadVehicle();
  }, [id, router]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const existingCount = vehicle?.images?.length || 0;
    const maxNewImages = 6 - existingCount;
    const remainingSlots = maxNewImages - images.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    if (filesToAdd.length === 0) {
      toast.error(`Solo puedes agregar ${maxNewImages} imagen(es) más`);
      return;
    }

    filesToAdd.forEach((file) => {
      if (file.type.startsWith("image/")) {
        setImages((prev) => [...prev, file]);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      }
    });

    // Limpar input
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (images.length === 0) {
      toast.error("Por favor seleccione al menos una imagen");
      return;
    }

    setUploading(true);
    try {
      // Buscar dados atuais do veículo
      const vehicleData = await getVehicleById(id);
      if (!vehicleData) {
        toast.error("Vehículo no encontrado");
        return;
      }

      const result = await updateVehicle(id, {
        brand: vehicleData.brand,
        model: vehicleData.model,
        year: vehicleData.year,
        color: vehicleData.color || "",
        cost_price: vehicleData.cost_price,
        price: vehicleData.price,
        plate: vehicleData.plate,
        mileage: vehicleData.mileage,
        status: vehicleData.status || "disponible",
        newImages: images,
        imagesToRemove: [],
      });

      if (result.success) {
        toast.success(`${images.length} imagen(es) subida(s) exitosamente`);
        router.push(`/vehicles/${id}`);
      } else {
        toast.error(result.message || "Error al subir imágenes");
      }
    } catch (error: any) {
      console.error("Error uploading images:", error);
      toast.error("Error al subir imágenes: " + (error.message || "Error desconocido"));
    } finally {
      setUploading(false);
    }
  };

  const existingCount = vehicle?.images?.length || 0;
  const maxNewImages = 6 - existingCount;
  const remainingSlots = maxNewImages - images.length;

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push(`/vehicles/${id}`)}
            className="bg-white border-black text-black hover:bg-zinc-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-zinc-900">
              Subir Fotos
            </h1>
            <p className="text-sm text-zinc-600">
              {images.length}/{maxNewImages} imágenes seleccionadas
            </p>
          </div>
        </div>

        {/* Botões de selección */}
        {remainingSlots > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageSelect}
              className="hidden"
              multiple
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              multiple
            />

            <Button
              onClick={() => cameraInputRef.current?.click()}
              variant="outline"
              className="bg-white border-black text-black hover:bg-zinc-50 h-20 flex-col"
            >
              <Camera className="h-6 w-6 mb-2" />
              <span className="text-sm">Tomar Foto</span>
            </Button>

            <Button
              onClick={() => galleryInputRef.current?.click()}
              variant="outline"
              className="bg-white border-black text-black hover:bg-zinc-50 h-20 flex-col"
            >
              <ImageIcon className="h-6 w-6 mb-2" />
              <span className="text-sm">Galería</span>
            </Button>
          </div>
        )}

        {remainingSlots === 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 text-center">
              Has alcanzado el límite de {maxNewImages} imagen(es) para este vehículo
            </p>
          </div>
        )}

        {/* Preview das imagens */}
        {previews.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {previews.map((preview, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border border-zinc-200"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-zinc-50 rounded-lg border-2 border-dashed border-zinc-300 mb-6">
            <ImageIcon className="h-12 w-12 text-zinc-400 mx-auto mb-2" />
            <p className="text-zinc-600">No hay imágenes seleccionadas</p>
            <p className="text-xs text-zinc-500 mt-1">
              Puedes tomar fotos o seleccionar de la galería
            </p>
          </div>
        )}

        {/* Botón de confirmar */}
        <Button
          onClick={handleUpload}
          disabled={uploading || images.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-base shadow-md"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Confirmar y Subir ({images.length} foto{images.length !== 1 ? 's' : ''})
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

