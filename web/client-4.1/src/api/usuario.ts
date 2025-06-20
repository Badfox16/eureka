import { Usuario } from "@/types/usuario";
import { Estudante } from "@/types/estudante";
import { EstudanteSearchParams, UsuarioSearchParams } from "@/types/search";
import { fetchApi, buildQueryString } from "./apiService";

// Função para listar usuários com suporte a paginação e filtros
export async function getUsuarios(params: UsuarioSearchParams) {
  const queryString = buildQueryString(params);
  return fetchApi<Usuario[]>(`/usuarios${queryString}`);
}

// Função para obter um usuário específico
export async function getUsuario(id: string) {
  return fetchApi<Usuario>(`/usuarios/${id}`);
}

// Função para buscar o perfil do usuário atual
export async function getPerfilUsuario() {
  return fetchApi<Usuario>(`/usuarios/profile`);
}

// Função para atualizar perfil do usuário
export async function updatePerfilUsuario(data: {
  nome?: string;
  email?: string;
}) {
  return fetchApi<Usuario>(`/usuarios/profile`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Função para listar estudantes com suporte a paginação e filtros
export async function getEstudantes(params: EstudanteSearchParams) {
  const queryString = buildQueryString({
    ...params,
    search: params.search,
    classe: params.classe,
    escola: params.escola,
    provincia: params.provincia,
    ativo: params.ativo,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder
  });
  
  return fetchApi<Estudante[]>(`/estudantes${queryString}`);
}

// Função para obter um estudante específico
export async function getEstudante(id: string) {
  return fetchApi<Estudante>(`/estudantes/${id}`);
}

// Função para buscar o perfil do estudante atual
export async function getPerfilEstudante() {
  return fetchApi<Estudante>(`/estudantes/me`);
}

// Função para atualizar dados do estudante
export async function updateEstudante(id: string, data: {
  nome?: string;
  email?: string;
  classe?: number;
  escola?: string;
  provincia?: string;
}) {
  return fetchApi<Estudante>(`/estudantes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Função para alterar a senha do usuário
export async function alterarSenha(data: {
  senhaAtual: string;
  novaSenha: string;
}) {
  return fetchApi<{ message: string }>(`/usuarios/password`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
