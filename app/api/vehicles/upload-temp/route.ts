import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const token = formData.get("token") as string;
    const files = formData.getAll("images") as File[];

    if (!token) {
      return NextResponse.json({ error: "Token é obrigatório" }, { status: 400 });
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Nenhuma imagem enviada" }, { status: 400 });
    }

    // Criar cliente admin para storage
    const storageClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const imageUrls: string[] = [];

    for (const file of files) {
      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `temp_${token}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `temp/${fileName}`;

        // Converter File para ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        const fileBytes = new Uint8Array(arrayBuffer);

        // Upload para Supabase Storage
        const { error: uploadError } = await storageClient.storage
          .from("cellecars")
          .upload(filePath, fileBytes, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          console.error("Error uploading temp image:", uploadError);
          continue;
        }

        // Obter URL pública
        const { data: urlData } = storageClient.storage
          .from("cellecars")
          .getPublicUrl(filePath);

        if (urlData?.publicUrl) {
          imageUrls.push(urlData.publicUrl);
        }
      } catch (error) {
        console.error("Error processing temp image:", error);
      }
    }

    // Salvar URLs em uma tabela temporária ou usar Supabase Storage metadata
    // Por enquanto, vamos retornar as URLs e o cliente vai salvar no localStorage também
    // Mas o importante é que as imagens estão no servidor

    return NextResponse.json({
      success: true,
      urls: imageUrls,
      token,
    });
  } catch (error: any) {
    console.error("Error in upload-temp:", error);
    return NextResponse.json(
      { error: "Error al subir imágenes: " + (error.message || "Error desconocido") },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token é obrigatório" }, { status: 400 });
    }

    // Buscar imagens temporárias do storage baseado no token
    const storageClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Listar todos os arquivos temporários e filtrar pelo token
    const { data: allFiles, error } = await storageClient.storage
      .from("cellecars")
      .list("temp");

    if (error) {
      console.error("Error listing temp files:", error);
      return NextResponse.json({ urls: [] });
    }

    // Filtrar arquivos que começam com o token
    const files = allFiles?.filter((file) => file.name.startsWith(`temp_${token}_`)) || [];

    if (error) {
      console.error("Error listing temp files:", error);
      return NextResponse.json({ urls: [] });
    }

    const urls: string[] = [];
    if (files) {
      for (const file of files) {
        const { data: urlData } = storageClient.storage
          .from("cellecars")
          .getPublicUrl(`temp/${file.name}`);
        if (urlData?.publicUrl) {
          urls.push(urlData.publicUrl);
        }
      }
    }

    return NextResponse.json({ success: true, urls });
  } catch (error: any) {
    console.error("Error in GET upload-temp:", error);
    return NextResponse.json({ error: "Error al obtener imágenes" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token é obrigatório" }, { status: 400 });
    }

    const storageClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Listar todos os arquivos temporários e filtrar pelo token
    const { data: allFiles } = await storageClient.storage
      .from("cellecars")
      .list("temp");

    // Filtrar arquivos que começam com o token
    const files = allFiles?.filter((file) => file.name.startsWith(`temp_${token}_`)) || [];

    if (files && files.length > 0) {
      const filePaths = files.map((file) => `temp/${file.name}`);
      await storageClient.storage.from("cellecars").remove(filePaths);
    }

    // Limpar imagens antigas (mais de 24 horas)
    const { data: allTempFiles } = await storageClient.storage
      .from("cellecars")
      .list("temp");

    if (allTempFiles) {
      const now = Date.now();
      const filesToDelete: string[] = [];

      for (const file of allTempFiles) {
        // Extrair timestamp do nome do arquivo (temp_token_timestamp_...)
        const parts = file.name.split("_");
        if (parts.length >= 3) {
          const timestamp = parseInt(parts[2]);
          if (!isNaN(timestamp)) {
            const ageInHours = (now - timestamp) / (1000 * 60 * 60);
            if (ageInHours > 24) {
              filesToDelete.push(`temp/${file.name}`);
            }
          }
        }
      }

      if (filesToDelete.length > 0) {
        await storageClient.storage.from("cellecars").remove(filesToDelete);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting temp files:", error);
    return NextResponse.json({ error: "Error al eliminar imágenes" }, { status: 500 });
  }
}

