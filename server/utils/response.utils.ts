export function formatResponse(data: any, meta?: any, message?: string) {
  return {
    status: 'success',
    ...(message && { message }),
    data,
    ...(meta && { meta })
  };
}