"use server";

import { createServerAdmin } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  cost_price: number;
  price: number;
  plate: string;
  color: string | null;
  status: string | null;
  created_at: string;
}

export interface VehicleFile {
  id: number;
  vehicle_id: number;
  url_img: string;
  created_at: string;
}

// ➜ Criar veículo
export async function createVehicle(data: {
  brand: string;
  model: string;
  year: number;
  mileage: number;
  cost_price: number;
  price: number;
  plate: string;
  color?: string;
  status?: string;
  images: File[];
}) {
  const supabase = await createServerAdmin();
  
  console.log("createVehicle chamado com", data.images?.length || 0, "imagens");

  // Inserir veículo
  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .insert({
      brand: data.brand,
      model: data.model,
      year: data.year,
      mileage: data.mileage,
      cost_price: data.cost_price,
      price: data.price,
      plate: data.plate.toUpperCase(),
      color: data.color || null,
      status: data.status || null,
    })
    .select()
    .single();

  if (vehicleError || !vehicle) {
    return { success: false, message: "Error al crear vehículo: " + vehicleError?.message };
  }

  // Upload de imagens
  if (data.images && data.images.length > 0) {
    console.log("Iniciando upload de", data.images.length, "imagens");
    const imageUrls: string[] = [];
    const uploadErrors: string[] = [];

    // Criar cliente admin direto para storage (bypassa RLS)
    const storageClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    for (const image of data.images) {
      console.log("Processando imagem:", image.name, "tipo:", image.type, "tamanho:", image.size);
      try {
        const fileExt = image.name.split(".").pop();
        const fileName = `${vehicle.id}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `images/${fileName}`;

        // Converter File para ArrayBuffer
        const arrayBuffer = await image.arrayBuffer();
        const fileBytes = new Uint8Array(arrayBuffer);

        // Upload para Supabase Storage usando cliente admin direto
        const { error: uploadError } = await storageClient.storage
          .from("cellecars")
          .upload(filePath, fileBytes, {
            contentType: image.type,
            upsert: false,
          });

        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          uploadErrors.push(`Erro ao fazer upload de ${image.name}: ${uploadError.message}`);
          continue;
        }

        // Obter URL pública da imagem
        const { data: urlData } = storageClient.storage
          .from("cellecars")
          .getPublicUrl(filePath);

        if (urlData?.publicUrl) {
          console.log("Imagem enviada com sucesso, URL:", urlData.publicUrl);
          imageUrls.push(urlData.publicUrl);
        } else {
          console.error("Não foi possível obter URL pública da imagem");
          uploadErrors.push(`Não foi possível obter URL de ${image.name}`);
        }
      } catch (error: any) {
        console.error("Error processing image:", error);
        uploadErrors.push(`Erro ao processar ${image.name}: ${error.message}`);
      }
    }

    // Salvar URLs na tabela vehicles_files
    if (imageUrls.length > 0) {
      console.log("Salvando", imageUrls.length, "URLs na tabela vehicles_files");
      const filesToInsert = imageUrls.map((url) => ({
        vehicle_id: vehicle.id,
        url_img: url,
      }));

      const { error: filesError, data: insertedData } = await supabase
        .from("vehicles_files")
        .insert(filesToInsert)
        .select();

      if (filesError) {
        console.error("Error saving image URLs:", filesError);
        return { 
          success: false, 
          message: `Vehículo creado pero error al guardar imágenes en la base de datos: ${filesError.message}. Código: ${filesError.code}` 
        };
      }
      
      console.log("Imagens salvas com sucesso na tabela:", insertedData?.length || 0);
    } else if (data.images.length > 0) {
      // Se havia imagens mas nenhuma foi salva
      console.error("Nenhuma imagem foi salva. Erros:", uploadErrors);
      return { 
        success: false, 
        message: `Vehículo creado pero no se pudieron subir las imágenes. Errores: ${uploadErrors.join(", ")}` 
      };
    }
  }

  return { success: true, vehicle };
}

// ➜ Listar veículos com imagens
export async function getVehicles() {
  const supabase = await createServerAdmin();

  const { data: vehicles, error: vehiclesError } = await supabase
    .from("vehicles")
    .select("*")
    .order("created_at", { ascending: false });

  if (vehiclesError) {
    console.error("Error fetching vehicles:", vehiclesError);
    return [];
  }

  // Buscar imagens para cada veículo
  const vehiclesWithImages = await Promise.all(
    (vehicles || []).map(async (vehicle) => {
      const { data: files } = await supabase
        .from("vehicles_files")
        .select("url_img")
        .eq("vehicle_id", vehicle.id)
        .order("created_at", { ascending: true });

      return {
        ...vehicle,
        images: files?.map((f) => f.url_img) || [],
      };
    })
  );

  return vehiclesWithImages;
}

// ➜ Buscar veículo por ID
export async function getVehicleById(id: number) {
  const supabase = await createServerAdmin();

  const { data: vehicle, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !vehicle) {
    return null;
  }

  // Buscar data de venda e informações do cliente (se o veículo foi vendido)
  let saleDate = null;
  let clientInfo = null;
  if (vehicle.status === "vendido") {
    const { data: sale } = await supabase
      .from("sales")
      .select(`
        sale_date,
        client:clients(id, name, phone)
      `)
      .eq("vehicle_id", vehicle.id)
      .order("sale_date", { ascending: false })
      .limit(1)
      .single();
    
    if (sale) {
      saleDate = sale.sale_date;
      clientInfo = sale.client;
    }
  }

  // Buscar imagens
  const { data: files } = await supabase
    .from("vehicles_files")
    .select("url_img")
    .eq("vehicle_id", vehicle.id)
    .order("created_at", { ascending: true });

  return {
    ...vehicle,
    images: files?.map((f) => f.url_img) || [],
    sale_date: saleDate,
    client: clientInfo,
  };
}

// ➜ Atualizar veículo
export async function updateVehicle(
  id: number,
  data: {
    brand: string;
    model: string;
    year: number;
    mileage: number;
    cost_price: number;
    price: number;
    plate: string;
    color?: string;
    status?: string;
    newImages?: File[];
    imagesToRemove?: string[];
  }
) {
  const supabase = await createServerAdmin();

  // Atualizar dados do veículo
  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .update({
      brand: data.brand,
      model: data.model,
      year: data.year,
      mileage: data.mileage,
      cost_price: data.cost_price,
      price: data.price,
      plate: data.plate.toUpperCase(),
      color: data.color || null,
      status: data.status || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (vehicleError || !vehicle) {
    return { success: false, message: "Error al actualizar vehículo: " + vehicleError?.message };
  }

  // Remover imagens
  if (data.imagesToRemove && data.imagesToRemove.length > 0) {
    // Criar cliente admin direto para storage (bypassa RLS)
    const storageClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    for (const imageUrl of data.imagesToRemove) {
      // Extrair caminho do arquivo da URL
      const urlParts = imageUrl.split("/");
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `images/${fileName}`;

      // Deletar do storage
      await storageClient.storage.from("cellecars").remove([filePath]);

      // Deletar registro da tabela
      await supabase
        .from("vehicles_files")
        .delete()
        .eq("url_img", imageUrl);
    }
  }

  // Adicionar novas imagens
  if (data.newImages && data.newImages.length > 0) {
    const imageUrls: string[] = [];

    // Criar cliente admin direto para storage (bypassa RLS)
    const storageClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    for (const image of data.newImages) {
      const fileExt = image.name.split(".").pop();
      const fileName = `${id}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `images/${fileName}`;

      const arrayBuffer = await image.arrayBuffer();
      const fileBytes = new Uint8Array(arrayBuffer);

      const { error: uploadError } = await storageClient.storage
        .from("cellecars")
        .upload(filePath, fileBytes, {
          contentType: image.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        continue;
      }

      const { data: urlData } = storageClient.storage
        .from("cellecars")
        .getPublicUrl(filePath);

      if (urlData?.publicUrl) {
        imageUrls.push(urlData.publicUrl);
      }
    }

    if (imageUrls.length > 0) {
      const filesToInsert = imageUrls.map((url) => ({
        vehicle_id: id,
        url_img: url,
      }));

      await supabase.from("vehicles_files").insert(filesToInsert);
    }
  }

  return { success: true, vehicle };
}

// ➜ Contar veículos
export async function getVehiclesCount() {
  const supabase = await createServerAdmin();

  const { count, error } = await supabase
    .from("vehicles")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Error counting vehicles:", error);
    return 0;
  }

  return count || 0;
}

// ➜ Excluir veículo
export async function deleteVehicle(id: number) {
  const supabase = await createServerAdmin();

  // Buscar imagens do veículo
  const { data: files } = await supabase
    .from("vehicles_files")
    .select("url_img")
    .eq("vehicle_id", id);

  // Criar cliente admin direto para storage (bypassa RLS)
  const storageClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  // Deletar imagens do storage
  if (files && files.length > 0) {
    for (const file of files) {
      const urlParts = file.url_img.split("/");
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `images/${fileName}`;
      await storageClient.storage.from("cellecars").remove([filePath]);
    }
  }

  // Deletar registros de imagens
  await supabase.from("vehicles_files").delete().eq("vehicle_id", id);

  // Deletar veículo
  const { error } = await supabase.from("vehicles").delete().eq("id", id);

  if (error) {
    return { success: false, message: "Error al eliminar vehículo: " + error.message };
  }

  return { success: true };
}
