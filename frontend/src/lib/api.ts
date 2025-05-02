export async function get<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, { ...options, method: 'GET' });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json() as T;
  } catch (error) {
    console.error('GET request failed:', error);
    throw error;
  }
}

export async function post<T>(url: string, data: any, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json() as T;
  } catch (error) {
    console.error('POST request failed:', error);
    throw error;
  }
}