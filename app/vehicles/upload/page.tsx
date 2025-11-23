"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Camera, Image as ImageIcon, X, Check, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

function VehicleUploadPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) {
      toast.error("Token inválido");
      router.push("/vehicles");
    }
  }, [token, router]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 6 - images.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    if (filesToAdd.length === 0) {
      toast.error(`Solo puedes agregar ${remainingSlots} imagen(es) más`);
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

  const handleSave = async () => {
    if (images.length === 0) {
      toast.error("Por favor seleccione al menos una imagen");
      return;
    }

    if (!token) {
      toast.error("Token inválido");
      return;
    }

    setSaving(true);
    try {
      // Criar FormData para enviar ao servidor
      const formData = new FormData();
      formData.append("token", token);
      images.forEach((file) => {
        formData.append("images", file);
      });

      // Enviar para o servidor
      const response = await fetch("/api/vehicles/upload-temp", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Error al subir imágenes";
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Error al subir imágenes");
      }

      // Também salvar no localStorage como backup
      const imagesData = await Promise.all(
        images.map(async (file) => {
          return new Promise<{ data: string; name: string; type: string }>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve({
                data: reader.result as string,
                name: file.name,
                type: file.type,
              });
            };
            reader.readAsDataURL(file);
          });
        })
      );
      localStorage.setItem(`temp_images_${token}`, JSON.stringify(imagesData));
      
      toast.success(`${images.length} imagen(es) subida(s). Las imágenes aparecerán automáticamente en el formulario.`);
      
      // Fechar a página após um breve delay
      setTimeout(() => {
        window.close();
      }, 1500);
    } catch (error: any) {
      console.error("Error saving images:", error);
      toast.error("Error al guardar imágenes: " + (error.message || "Error desconocido"));
    } finally {
      setSaving(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-white p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-600 mb-4">Token inválido</p>
          <Button onClick={() => router.push("/vehicles")}>
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => window.close()}
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
              {images.length}/6 imágenes seleccionadas
            </p>
          </div>
        </div>

        {/* Botões de selección */}
        {images.length < 6 && (
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

        {images.length >= 6 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 text-center">
              Has alcanzado el límite de 6 imágenes
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
          onClick={handleSave}
          disabled={saving || images.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-base shadow-md"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Guardar y Volver ({images.length} foto{images.length !== 1 ? 's' : ''})
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function VehicleUploadPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white p-4 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    }>
      <VehicleUploadPageContent />
    </Suspense>
  );
}
