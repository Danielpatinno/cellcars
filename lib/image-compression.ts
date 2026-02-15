/**
 * Comprime uma imagem reduzindo sua qualidade e/ou dimensões
 * @param file Arquivo de imagem original
 * @param maxWidth Largura máxima (padrão: 1920px)
 * @param maxHeight Altura máxima (padrão: 1920px)
 * @param quality Qualidade de compressão (0-1, padrão: 0.8)
 * @returns Promise<File> Arquivo comprimido
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calcular novas dimensões mantendo proporção
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }
        
        // Criar canvas para redimensionar
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Não foi possível criar contexto do canvas"));
          return;
        }
        
        // Desenhar imagem redimensionada
        ctx.drawImage(img, 0, 0, width, height);
        
        // Converter para blob com qualidade reduzida
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Erro ao comprimir imagem"));
              return;
            }
            
            // Criar novo File com o blob comprimido
            const compressedFile = new File(
              [blob],
              file.name,
              {
                type: "image/jpeg", // Sempre usar JPEG para melhor compressão
                lastModified: Date.now(),
              }
            );
            
            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error("Erro ao carregar imagem"));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error("Erro ao ler arquivo"));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Comprime múltiplas imagens
 */
export async function compressImages(
  files: File[],
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.8
): Promise<File[]> {
  return Promise.all(
    files.map((file) => compressImage(file, maxWidth, maxHeight, quality))
  );
}


