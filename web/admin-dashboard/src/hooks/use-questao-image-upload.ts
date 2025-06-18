import { useImageUpload } from './use-image-upload';
import { 
  useUploadImagemEnunciado, 
  useUploadImagemAlternativa 
} from './use-questoes';
import { ApiResponse } from '@/types/api';

interface QuestaoImageUploadOptions {
  questaoId?: string;
  useTempUpload?: boolean;
}

export function useQuestaoImageUpload(options: QuestaoImageUploadOptions = {}) {
  // Hook genérico para upload temporário
  const { uploadImage: uploadTempImage } = useImageUpload({
    endpoint: "/temp/uploads"
  });
  
  // Hooks específicos para questões
  const enunciadoMutation = useUploadImagemEnunciado();
  const alternativaMutation = useUploadImagemAlternativa();
  
  // Upload para o enunciado
  const uploadEnunciadoImage = async (file: File): Promise<string> => {
    try {
      // Se não temos ID da questão ou estamos criando, usar o upload temporário
      if (!options.questaoId || options.useTempUpload) {
        return uploadTempImage(file);
      }
      
      // Se temos ID, usar o upload específico para o enunciado
      const response = await enunciadoMutation.mutateAsync({ 
        id: options.questaoId, 
        file 
      });
      
      // Verificar se temos a URL na resposta
      if (!response.data || !response.data.imageUrl) {
        throw new Error("URL da imagem não encontrada na resposta");
      }
      
      return response.data.imageUrl;
    } catch (error: any) {
      console.error("Erro ao fazer upload da imagem do enunciado:", error);
      throw new Error(`Falha ao fazer upload: ${error.message}`);
    }
  };
  
  // Upload para alternativa
  const uploadAlternativaImage = async (file: File, letra: string): Promise<string> => {
    try {
      // Se não temos ID da questão ou estamos criando, usar o upload temporário
      if (!options.questaoId || options.useTempUpload) {
        return uploadTempImage(file);
      }
      
      // Se temos ID, usar o upload específico para a alternativa
      const response = await alternativaMutation.mutateAsync({ 
        id: options.questaoId, 
        letra, 
        file 
      });
      
      // Verificar se temos a URL na resposta
      if (!response.data || !response.data.imageUrl) {
        throw new Error("URL da imagem não encontrada na resposta");
      }
      
      return response.data.imageUrl;
    } catch (error: any) {
      console.error(`Erro ao fazer upload da imagem da alternativa ${letra}:`, error);
      throw new Error(`Falha ao fazer upload: ${error.message}`);
    }
  };
  
  return {
    uploadEnunciadoImage,
    uploadAlternativaImage,
    isUploadingEnunciado: enunciadoMutation.isPending,
    isUploadingAlternativa: alternativaMutation.isPending
  };
}