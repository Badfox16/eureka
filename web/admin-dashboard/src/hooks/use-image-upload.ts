import { useState } from 'react';
import { toast } from 'sonner';

interface UseImageUploadOptions {
  endpoint?: string;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadImage = async (file: File): Promise<string> => {
    if (!file) {
      throw new Error('Nenhum arquivo selecionado');
    }

    // Validar o tipo de arquivo
    if (!file.type.startsWith('image/')) {
      throw new Error('O arquivo deve ser uma imagem');
    }

    // Validar o tamanho do arquivo (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('A imagem deve ter no máximo 5MB');
    }

    setIsUploading(true);
    setProgress(0);

    try {
      // Criar o FormData para enviar a imagem
      const formData = new FormData();
      formData.append('file', file);

      // Definir o endpoint padrão se não for fornecido
      const endpoint = options.endpoint || '/api/upload';

      // Fazer a requisição para o servidor
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        // Opcional: acompanhar o progresso do upload
        // É necessário um polyfill para XMLHttpRequest em alguns ambientes
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Erro ao fazer upload da imagem');
      }

      const data = await response.json();
      const imageUrl = data.url;

      if (options.onSuccess) {
        options.onSuccess(imageUrl);
      }

      return imageUrl;
    } catch (error: any) {
      console.error('Erro no upload:', error);
      
      if (options.onError) {
        options.onError(error);
      }
      
      toast.error(`Erro ao fazer upload: ${error.message}`);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImage,
    isUploading,
    progress
  };
}