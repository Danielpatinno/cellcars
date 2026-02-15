"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Edit, Save, X, Trash2, ZoomIn, X as XIcon, DollarSign, MessageCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  Vehicle,
} from "../actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CurrencyInput } from "@/components/ui/currency-input";
import FormattedDate from "@/components/FormattedDate";
import { compressImages } from "@/lib/image-compression";
import { formatCurrency } from "@/lib/currency-utils";
import { useWhatsApp } from "@/hooks/useWhatsApp";

interface VehicleWithImages extends Vehicle {
  images?: string[];
  client?: {
    id: number;
    name: string;
    phone: string;
  } | null;
}

export default function VehicleDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  const [vehicle, setVehicle] = useState<VehicleWithImages | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { openWhatsApp } = useWhatsApp();

  const [showZoomImage, setShowZoomImage] = useState(false);
  const [zoomedImageUrl, setZoomedImageUrl] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
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
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  const [newImagesFiles, setNewImagesFiles] = useState<File[]>([]);
  const [newImagesPreview, setNewImagesPreview] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadVehicle();
    
    // Inicializar year
    setFormData((prev) => ({ ...prev, year: new Date().getFullYear() }));
  }, [id]);

  const loadVehicle = async () => {
    setLoading(true);
    try {
      const data = await getVehicleById(id);
      if (data) {
        setVehicle(data);
        setFormData({
          brand: data.brand,
          model: data.model,
          year: data.year,
          color: data.color || "",
          cost_price: data.cost_price,
          price: data.price,
          plate: data.plate,
          mileage: data.mileage,
          status: data.status || "disponible",
        });
        setExistingImages(data.images || []);
      }
    } catch (error) {
      console.error("Error loading vehicle:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const totalImages = existingImages.length - imagesToRemove.length + newImagesPreview.length;
    const remainingSlots = 6 - totalImages;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    filesToAdd.forEach((file) => {
      if (file.type.startsWith("image/")) {
        setNewImagesFiles((prev) => [...prev, file]);
        
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setNewImagesPreview((prev) => [...prev, result]);
        };
        reader.readAsDataURL(file);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeExistingImage = (imageUrl: string) => {
    setImagesToRemove([...imagesToRemove, imageUrl]);
  };

  const removeNewImage = (index: number) => {
    setNewImagesPreview((prev) => prev.filter((_, i) => i !== index));
    setNewImagesFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Comprimir novas imagens antes de enviar
      let imagesToUpload = newImagesFiles;
      if (newImagesFiles.length > 0) {
        try {
          toast.info("Comprimiendo imágenes...");
          imagesToUpload = await compressImages(newImagesFiles, 1920, 1920, 0.8);
        } catch (compressError) {
          console.error("Error comprimiendo imágenes:", compressError);
          toast.warning("Error al comprimir algunas imágenes, intentando subir originales...");
          // Continuar com imagens originais se compressão falhar
        }
      }
      
      const result = await updateVehicle(id, {
        brand: formData.brand,
        model: formData.model,
        year: formData.year,
        color: formData.color,
        cost_price: formData.cost_price,
        price: formData.price,
        plate: formData.plate,
        mileage: formData.mileage,
        status: formData.status,
        newImages: imagesToUpload,
        imagesToRemove: imagesToRemove,
      });

      if (result.success) {
        toast.success("Vehículo actualizado exitosamente");
        setEditing(false);
        setImagesToRemove([]);
        setNewImagesFiles([]);
        setNewImagesPreview([]);
        loadVehicle();
      } else {
        toast.error(result.message || "Error al actualizar vehículo");
      }
    } catch (error: any) {
      console.error("Error updating vehicle:", error);
      toast.error("Error al actualizar vehículo: " + (error.message || "Error desconocido"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const result = await deleteVehicle(id);
      if (result.success) {
        toast.success("Vehículo eliminado exitosamente");
        router.push("/vehicles");
      } else {
        toast.error(result.message || "Error al eliminar vehículo");
      }
    } catch (error: any) {
      console.error("Error deleting vehicle:", error);
      toast.error("Error al eliminar vehículo: " + (error.message || "Error desconocido"));
    } finally {
      setLoading(false);
    }
  };

  const openZoom = (imageUrl: string, index: number) => {
    setZoomedImageUrl(imageUrl);
    setSelectedImageIndex(index);
    setShowZoomImage(true);
  };

  const navigateImage = (direction: "prev" | "next") => {
    const allImages = [
      ...existingImages.filter((img) => !imagesToRemove.includes(img)),
      ...newImagesPreview,
    ];
    let newIndex = selectedImageIndex;
    if (direction === "prev") {
      newIndex = selectedImageIndex > 0 ? selectedImageIndex - 1 : allImages.length - 1;
    } else {
      newIndex = selectedImageIndex < allImages.length - 1 ? selectedImageIndex + 1 : 0;
    }
    setSelectedImageIndex(newIndex);
    setZoomedImageUrl(allImages[newIndex]);
  };

  const calculateProfitMargin = () => {
    if (!formData.cost_price || formData.cost_price === 0) return 0;
    const profit = formData.price - formData.cost_price;
    return ((profit / formData.cost_price) * 100).toFixed(2);
  };

  if (loading && !vehicle) {
    return (
      <div className="p-8">
        <p className="text-zinc-600">Cargando...</p>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="p-8">
        <p className="text-zinc-600">Vehículo no encontrado</p>
        <Button onClick={() => router.push("/vehicles")} className="mt-4">
          Volver
        </Button>
      </div>
    );
  }

  const displayImages = [
    ...existingImages.filter((img) => !imagesToRemove.includes(img)),
    ...newImagesPreview,
  ];

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" onClick={() => router.push("/vehicles")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-zinc-900">
            {editing ? "Editar Vehículo" : "Detalles del Vehículo"}
          </h1>
        </div>
        {!editing ? (
          <div className="flex gap-2">
            {vehicle.status === "disponible" && (
              <Button
                onClick={() => router.push(`/sales/new?vehicle_id=${vehicle.id}`)}
                variant="outline"
                className="bg-white border-green-600 text-green-600 hover:bg-green-50"
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Vender Vehículo
              </Button>
            )}
            {vehicle.status === "vendido" && vehicle.client && vehicle.client.phone && (
              <Button
                onClick={() => openWhatsApp(vehicle.client!.phone)}
                variant="outline"
                className="bg-green-50 border-green-600 text-green-600 hover:bg-green-100"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Enviar Mensaje
              </Button>
            )}
            <Button onClick={() => setEditing(true)} variant="outline" className="bg-white border-black text-black hover:bg-zinc-50">
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button 
              onClick={handleSave} 
              disabled={loading} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-base shadow-md"
            >
              <Save className="mr-2 h-4 w-4" />
              Guardar
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setEditing(false);
                loadVehicle();
                setImagesToRemove([]);
                setNewImagesFiles([]);
                setNewImagesPreview([]);
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Galeria de Imágenes */}
        <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-black">Imágenes</h2>
          </div>
          {displayImages.length > 0 ? (
            <div className="space-y-4">
              {/* Imagen Principal */}
              <div className="relative aspect-video overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
                <img
                  src={displayImages[0]}
                  alt="Imagen principal"
                  className="h-full w-full object-cover cursor-pointer"
                  onClick={() => openZoom(displayImages[0], 0)}
                />
                <div className="absolute top-2 right-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openZoom(displayImages[0], 0)}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
                {editing && existingImages.includes(displayImages[0]) && (
                  <div className="absolute top-2 left-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeExistingImage(displayImages[0])}
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              {/* Miniaturas */}
              {displayImages.length > 1 && (
                <div className="grid grid-cols-3 gap-2">
                  {displayImages.slice(1).map((img, index) => (
                    <div
                      key={index}
                      className="relative aspect-square overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 cursor-pointer group"
                      onClick={() => openZoom(img, index + 1)}
                    >
                      <img
                        src={img}
                        alt={`Imagen ${index + 2}`}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      {editing && existingImages.includes(img) && (
                        <div className="absolute top-1 right-1">
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeExistingImage(img);
                            }}
                          >
                            <XIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      {editing && newImagesPreview.includes(img) && (
                        <div className="absolute top-1 right-1">
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNewImage(newImagesPreview.indexOf(img));
                            }}
                          >
                            <XIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {/* Botón para agregar más imágenes */}
              {editing && displayImages.length < 6 && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Agregar Imágenes ({displayImages.length}/6)
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-zinc-300 rounded-lg">
              <p className="text-zinc-600">No hay imágenes</p>
              {editing && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Agregar Imágenes
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Información Básica del Vehículo */}
        <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-black">Información Básica</h2>
          {editing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-500">
                    Marca *
                  </label>
                  <Input
                    required
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-500">
                    Modelo *
                  </label>
                  <Input
                    required
                    value={formData.model}
                    onChange={(e) =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-500">
                    Año *
                  </label>
                  <Input
                    type="number"
                    required
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: parseInt(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-500">
                    Color
                  </label>
                  <Input
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
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
                      Margen de Ganancia
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
                  <Input
                    value={formData.plate}
                    onChange={(e) =>
                      setFormData({ ...formData, plate: e.target.value.toUpperCase() })
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-500">
                    Kilometraje
                  </label>
                  <Input
                    type="number"
                    value={formData.mileage}
                    onChange={(e) =>
                      setFormData({ ...formData, mileage: parseInt(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-500">
                    Estado *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="disponible">Disponible</option>
                    <option value="reservado">Reservado</option>
                    <option value="vendido">Vendido</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-500">Marca</label>
                <p className="mt-1 text-lg text-zinc-900 font-medium">{vehicle.brand}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-500">Modelo</label>
                <p className="mt-1 text-lg text-zinc-900 font-medium">{vehicle.model}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-500">Año</label>
                <p className="mt-1 text-lg text-zinc-900">{vehicle.year}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-500">Color</label>
                <p className="mt-1 text-lg text-zinc-900">{vehicle.color || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-500">Chapa</label>
                <p className="mt-1 text-lg text-zinc-900">{vehicle.plate}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-500">Kilometraje</label>
                <p className="mt-1 text-lg text-zinc-900">{vehicle.mileage.toLocaleString("es-ES")} km</p>
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-500">Estado</label>
                <p className="mt-1">
                  <span
                    className={`px-2 py-1 text-sm font-medium rounded ${
                      vehicle.status === "disponible"
                        ? "bg-green-100 text-green-800"
                        : vehicle.status === "vendido"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {vehicle.status}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Información Financiera e Adicional - Largura Completa */}
      {!editing && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Información Financiera */}
          <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-black">Información Financiera</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-500">Precio de Costo</label>
                <p className="mt-1 text-lg text-zinc-900 font-semibold">
                  ${formatCurrency(vehicle.cost_price || 0)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-500">Precio de Venta</label>
                <p className="mt-1 text-lg text-zinc-900 font-semibold">
                  ${formatCurrency(vehicle.price || 0)}
                </p>
              </div>
              {vehicle.cost_price > 0 && (
                <div>
                  <label className="text-sm font-medium text-zinc-500">Margen de Ganancia</label>
                  <p className="mt-1 text-2xl font-bold text-blue-600">
                    {calculateProfitMargin()}%
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Información Adicional */}
          <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-black">Información Adicional</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-500">Fecha de Registro</label>
                <p className="mt-1 text-lg text-zinc-900">
                  <FormattedDate date={vehicle.created_at} format="date" />
                </p>
              </div>
              {(vehicle as any).sale_date && (
                <div>
                  <label className="text-sm font-medium text-zinc-500">Fecha de Venta</label>
                  <p className="mt-1 text-lg text-zinc-900">
                    <FormattedDate date={(vehicle as any).sale_date} format="date" />
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dialog de zoom de imagen */}
      {showZoomImage && (
        <Dialog open={showZoomImage} onOpenChange={setShowZoomImage}>
          <DialogContent className="max-w-4xl">
            <div className="relative">
              <img
                src={zoomedImageUrl}
                alt="Imagen ampliada"
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              {displayImages.length > 1 && (
                <div className="absolute top-4 left-4 right-4 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => navigateImage("prev")}
                  >
                    ← Anterior
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigateImage("next")}
                  >
                    Siguiente →
                  </Button>
                </div>
              )}
              <div className="absolute top-4 right-4">
                <Button
                  variant="outline"
                  onClick={() => setShowZoomImage(false)}
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-black">Confirmar Eliminación</DialogTitle>
            <DialogDescription className="text-black">
              ¿Está seguro de que desea eliminar este vehículo? Esta acción no se puede
              deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

