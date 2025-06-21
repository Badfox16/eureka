import { formatarParametrosURL } from "@/utils/url";
import { fetchApi } from "./apiService";
import type { 
  Provincia, 
  CreateProvinciaInput, 
  UpdateProvinciaInput, 
  ProvinciaSearchParams 
} from "@/types/provincia";
import type { ApiResponse, ApiResponsePaginated } from "@/types/api";

const API_ENDPOINT = "/provincias";

// Buscar todas as províncias (com opção de paginação e filtros)
export const getProvincias = async (params?: ProvinciaSearchParams): Promise<ApiResponsePaginated<Provincia[]>> => {
  const queryParams = params ? formatarParametrosURL(params) : "";
  return fetchApi<ApiResponsePaginated<Provincia[]>>(`${API_ENDPOINT}${queryParams}`);
};

// Buscar uma província pelo ID
export const getProvinciaById = async (id: string): Promise<ApiResponse<Provincia>> => {
  return fetchApi<ApiResponse<Provincia>>(`${API_ENDPOINT}/${id}`);
};

// Buscar províncias por termo de pesquisa
export const searchProvincias = async (query: string): Promise<ApiResponse<Provincia[]>> => {
  return fetchApi<ApiResponse<Provincia[]>>(`${API_ENDPOINT}/search?q=${encodeURIComponent(query)}`);
};

// Criar uma nova província
export const createProvincia = async (data: CreateProvinciaInput): Promise<ApiResponse<Provincia>> => {
  return fetchApi<ApiResponse<Provincia>>(API_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

// Criar múltiplas províncias em massa
export const createProvinciasEmMassa = async (data: CreateProvinciaInput[]): Promise<ApiResponse<Provincia[]>> => {
  return fetchApi<ApiResponse<Provincia[]>>(`${API_ENDPOINT}/batch`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

// Atualizar uma província
export const updateProvincia = async (id: string, data: UpdateProvinciaInput): Promise<ApiResponse<Provincia>> => {
  return fetchApi<ApiResponse<Provincia>>(`${API_ENDPOINT}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

// Remover uma província
export const deleteProvincia = async (id: string): Promise<ApiResponse<null>> => {
  return fetchApi<ApiResponse<null>>(`${API_ENDPOINT}/${id}`, {
    method: 'DELETE'
  });
};
