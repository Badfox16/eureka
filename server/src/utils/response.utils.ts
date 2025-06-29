/**
 * Formata a resposta da API no padrão padronizado
 * @param data Os dados a serem incluídos na resposta
 * @param paginationData Informações de paginação (opcional)
 * @param message Mensagem opcional para incluir na resposta
 * @returns Objeto formatado para resposta da API
 */
export function formatResponse(data: any, paginationData?: any, message?: string) {
  const response: any = { data };
  
  if (message) {
    response.message = message;
  }
  
  if (paginationData) {
    const { page, limit, total } = paginationData;
    const totalPages = Math.ceil(total / limit);
    
    response.pagination = {
      total,
      totalPages,
      currentPage: page,
      limit,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null
    };
  }
  
  return response;
}