import { formatarParametrosURL } from "@/utils/url";
import { fetchApi } from "./apiService";
import type { 
  Disciplina, 
  CreateDisciplinaInput, 
  UpdateDisciplinaInput, 
  DisciplinaSearchParams 
} from "@/types/disciplina";
import type { ApiResponse, ApiResponsePaginated } from "@/types/api";

const API_ENDPOINT = "/disciplinas";

// Buscar todas as disciplinas (com opção de paginação e filtros)
export const getDisciplinas = async (params?: DisciplinaSearchParams): Promise<ApiResponsePaginated<Disciplina[]>> => {
  const queryParams = formatarParametrosURL(params || {});
  return fetchApi<ApiResponsePaginated<Disciplina[]>>(`${API_ENDPOINT}${queryParams}`);
};

// Buscar uma disciplina pelo ID
export const getDisciplinaById = async (id: string): Promise<ApiResponse<Disciplina>> => {
  return fetchApi<ApiResponse<Disciplina>>(`${API_ENDPOINT}/${id}`);
};

// Buscar disciplinas por termo de pesquisa
export const searchDisciplinas = async (query: string): Promise<ApiResponse<Disciplina[]>> => {
  return fetchApi<ApiResponse<Disciplina[]>>(`${API_ENDPOINT}/search?q=${encodeURIComponent(query)}`);
};

// Criar uma nova disciplina
export const createDisciplina = async (data: CreateDisciplinaInput): Promise<ApiResponse<Disciplina>> => {
  return fetchApi<ApiResponse<Disciplina>>(API_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

// Criar múltiplas disciplinas em massa
export const createDisciplinasEmMassa = async (data: CreateDisciplinaInput[]): Promise<ApiResponse<Disciplina[]>> => {
  return fetchApi<ApiResponse<Disciplina[]>>(`${API_ENDPOINT}/batch`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

// Atualizar uma disciplina
export const updateDisciplina = async (id: string, data: UpdateDisciplinaInput): Promise<ApiResponse<Disciplina>> => {
  return fetchApi<ApiResponse<Disciplina>>(`${API_ENDPOINT}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

// Remover uma disciplina
export const deleteDisciplina = async (id: string): Promise<ApiResponse<null>> => {
  return fetchApi<ApiResponse<null>>(`${API_ENDPOINT}/${id}`, {
    method: 'DELETE'
  });
};
