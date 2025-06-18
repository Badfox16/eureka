import { 
  useUploadImagemEnunciado, 
  useUploadImagemAlternativa 
} from './use-questoes';
import { questaoService } from '@/services/questao.service';

interface QuestaoImageUploadOptions {
  questaoId?: string;
  useTempUpload?: boolean;
}

export function useQuestaoImageUpload(options: QuestaoImageUploadOptions = {}) {
  // Hooks já existentes no use-questoes.ts
  const enunciadoMutation = useUploadImagemEnunciado();
  const alternativaMutation = useUploadImagemAlternativa();
  
  // Upload para o enunciado
  const uploadEnunciadoImage = async (file: File): Promise<string> => {
    try {
      // Se não temos ID da questão ou estamos criando, usar upload temporário
      if (!options.questaoId || options.useTempUpload) {
        // Assumindo que existe um método uploadTempImage no service
        const response = await questaoService.uploadTempImage(file);
        return response.data.imageUrl;
      }
      
      // Se temos ID, usar o upload específico para o enunciado
      const response = await enunciadoMutation.mutateAsync({ 
        id: options.questaoId, 
        file 
      });
      
      // Extrair a URL da imagem da resposta
      return response.data.imageUrl;
    } catch (error: any) {
      console.error("Erro ao fazer upload da imagem do enunciado:", error);
      throw new Error(`Falha ao fazer upload: ${error.message}`);
    }
  };
  
  // Upload para alternativa
  const uploadAlternativaImage = async (file: File, letra: string): Promise<string> => {
    try {
      // Se não temos ID da questão ou estamos criando, usar upload temporário
      if (!options.questaoId || options.useTempUpload) {
        // Assumindo que existe um método uploadTempImage no service
        const response = await questaoService.uploadTempImage(file);
        return response.data.imageUrl;
      }
      
      // Se temos ID, usar o upload específico para a alternativa
      const response = await alternativaMutation.mutateAsync({ 
        id: options.questaoId, 
        letra, 
        file 
      });
      
      // Extrair a URL da imagem da resposta
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