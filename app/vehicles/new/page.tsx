"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Car, X, Image as ImageIcon, Upload, Loader2, ArrowLeft, QrCode } from "lucide-react";
import { createVehicle } from "../actions";
import { CurrencyInput } from "@/components/ui/currency-input";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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
  const [removedImageUrls, setRemovedImageUrls] = useState<Set<string>>(new Set());
  const [showQRCode, setShowQRCode] = useState(false);
  const [uploadUrl, setUploadUrl] = useState("");
  const [showIPInput, setShowIPInput] = useState(false);
  const [localIP, setLocalIP] = useState("");
  const [uploadToken, setUploadToken] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, year: new Date().getFullYear() }));
    
    // Gerar token único para este formulário
    const token = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setUploadToken(token);
    
    // Configurar URL de upload
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const port = window.location.port || '3000';
      
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        const savedIP = localStorage.getItem('localIP');
        if (savedIP) {
          setUploadUrl(`http://${savedIP}:${port}/vehicles/upload?token=${token}`);
        } else {
          setShowIPInput(true);
          setUploadUrl(`http://[CONFIGURE-IP]:${port}/vehicles/upload?token=${token}`);
        }
      } else {
        setUploadUrl(`${window.location.origin}/vehicles/upload?token=${token}`);
      }
    }
  }, []);

  // Verificar periodicamente se há novas imagens (quando o usuário volta do celular)
  useEffect(() => {
    if (!uploadToken) return;
    
    const loadTempImages = async () => {
      try {
        // Primeiro, tentar buscar do servidor
        const response = await fetch(`/api/vehicles/upload-temp?token=${uploadToken}`);
        const result = await response.json();
        
        if (result.success && result.urls && result.urls.length > 0) {
          // Converter URLs para Files
          const loadedFiles: File[] = [];
          const loadedPreviews: string[] = [];
          
          for (const url of result.urls) {
            // Ignorar URLs que foram removidas pelo usuário
            if (removedImageUrls.has(url)) {
              continue;
            }
            // Ignorar URLs que já estão nas previews
            if (imagensPreview.includes(url)) {
              continue;
            }
            
            try {
              const imageResponse = await fetch(url);
              const blob = await imageResponse.blob();
              const fileName = url.split('/').pop() || `image_${Date.now()}.jpg`;
              const file = new File([blob], fileName, { type: blob.type });
              loadedFiles.push(file);
              loadedPreviews.push(url);
            } catch (error) {
              console.error("Error loading image from URL:", error);
            }
          }
          
          // Só atualizar se houver novas imagens
          if (loadedFiles.length > 0) {
            setImagensFiles((prev) => [...prev, ...loadedFiles]);
            setImagensPreview((prev) => [...prev, ...loadedPreviews]);
            toast.success(`${loadedFiles.length} imagen(es) cargada(s) desde el celular`);
            
            // Limpar imagens temporárias do localStorage após carregar (já estão no servidor)
            localStorage.removeItem(`temp_images_${uploadToken}`);
          }
        } else {
          // Fallback: tentar localStorage
          const savedImages = localStorage.getItem(`temp_images_${uploadToken}`);
          if (savedImages) {
            try {
              const imagesData = JSON.parse(savedImages);
              const loadedFiles: File[] = [];
              const loadedPreviews: string[] = [];
              
              for (const imgData of imagesData) {
                const response = await fetch(imgData.data);
                const blob = await response.blob();
                const file = new File([blob], imgData.name, { type: imgData.type });
                loadedFiles.push(file);
                loadedPreviews.push(imgData.data);
              }
              
              if (loadedFiles.length > imagensFiles.length) {
                setImagensFiles(loadedFiles);
                setImagensPreview(loadedPreviews);
                localStorage.removeItem(`temp_images_${uploadToken}`);
                toast.success(`${loadedFiles.length} imagen(es) cargada(s) desde el celular`);
              }
            } catch (error) {
              console.error("Error loading temp images from localStorage:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error loading temp images:", error);
      }
    };
    
    loadTempImages();
    
    // Verificar periodicamente se há novas imagens
    const interval = setInterval(() => {
      loadTempImages();
    }, 2000); // Verifica a cada 2 segundos
    
    return () => clearInterval(interval);
  }, [uploadToken, imagensFiles.length, imagensPreview, removedImageUrls]);

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
    const removedUrl = imagensPreview[index];
    // Marcar URL como removida para não buscar novamente
    if (removedUrl) {
      setRemovedImageUrls((prev) => new Set(prev).add(removedUrl));
    }
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
        toast.success("Vehículo creado exitosamente");
        // Limpar imagens temporárias do servidor
        if (uploadToken) {
          try {
            await fetch(`/api/vehicles/upload-temp?token=${uploadToken}`, {
              method: "DELETE",
            });
          } catch (error) {
            console.error("Error cleaning temp images:", error);
          }
          localStorage.removeItem(`temp_images_${uploadToken}`);
        }
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-zinc-500">
                  Imágenes del Vehículo (máximo 6)
                </label>
                <Button
                  onClick={() => setShowQRCode(true)}
                  variant="outline"
                  size="sm"
                  className="bg-white border-black text-black hover:bg-zinc-50"
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  QR para Subir Fotos
                </Button>
              </div>
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
                onClick={async () => {
                  // Limpar imagens temporárias ao cancelar
                  if (uploadToken) {
                    try {
                      await fetch(`/api/vehicles/upload-temp?token=${uploadToken}`, {
                        method: "DELETE",
                      });
                    } catch (error) {
                      console.error("Error cleaning temp images:", error);
                    }
                    localStorage.removeItem(`temp_images_${uploadToken}`);
                  }
                  router.push("/vehicles");
                }}
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

      {/* Dialog do QR Code */}
      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-black">Escanea para Subir Fotos</DialogTitle>
            <DialogDescription className="text-black">
              Escanea este código QR con tu celular para subir fotos directamente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {showIPInput && (
              <div className="space-y-2">
                <p className="text-sm text-zinc-600">
                  Para usar en desarrollo, informe el IP local de su máquina:
                </p>
                <Input
                  type="text"
                  placeholder="Ex: 192.168.1.100"
                  value={localIP}
                  onChange={(e) => {
                    const ip = e.target.value;
                    setLocalIP(ip);
                    if (ip && uploadToken) {
                      const port = window.location.port || '3000';
                      const newUrl = `http://${ip}:${port}/vehicles/upload?token=${uploadToken}`;
                      setUploadUrl(newUrl);
                      localStorage.setItem('localIP', ip);
                      setShowIPInput(false);
                    }
                  }}
                  className="border-black text-black"
                />
                <p className="text-xs text-zinc-500">
                  Descubra su IP: Windows (ipconfig) o Mac/Linux (ifconfig)
                </p>
              </div>
            )}
            {uploadUrl && !uploadUrl.includes('[CONFIGURE-IP]') && (
              <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-lg border border-zinc-200">
                  <QRCodeSVG value={uploadUrl} size={256} />
                </div>
                <p className="text-xs text-zinc-500 mt-4 text-center break-all px-4">
                  {uploadUrl}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowQRCode(false)}
              className="bg-white border-black text-black hover:bg-zinc-50"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

