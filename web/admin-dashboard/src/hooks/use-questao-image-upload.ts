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
        console.log("Iniciando upload temporário de imagem...");
        console.log("Arquivo:", file.name, file.type, file.size);
        
        // Chama o método de upload temporário
        const response = await questaoService.uploadTempImage(file);
        console.log("Resposta do upload temporário:", response);
        
        // Retorna a URL da imagem (ajustando a extração conforme a resposta real)
        return response.data.imageUrl;
      }
      
      // Se temos ID, usar o upload específico para o enunciado
      console.log("Iniciando upload de imagem para enunciado...");
      const response = await enunciadoMutation.mutateAsync({ 
        id: options.questaoId, 
        file 
      });
      
      // Extrair a URL da imagem da resposta
      console.log("Resposta do upload para enunciado:", response);
      return response.data.imageUrl;
    } catch (error: any) {
      console.error("Erro detalhado ao fazer upload:", error);
      
      // Capturar detalhes mais específicos do erro
      if (error.response) {
        console.error("Resposta do servidor:", error.response);
      }
      
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