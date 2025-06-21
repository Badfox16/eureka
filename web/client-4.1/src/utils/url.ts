/**
 * Função para formatar parâmetros de URL a partir de um objeto
 * @param params Objeto com parâmetros
 * @returns String formatada para usar como query string (ex: ?param1=valor1&param2=valor2)
 */
export function formatarParametrosURL(params: Record<string, any>): string {
  const filteredParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&');
  
  return filteredParams ? `?${filteredParams}` : '';
}
