import { ApiError, BASE_URL } from './api.ts';
import { getToken } from './tokenStorage.ts';

// Fetches a file from the API with the session token and hands it to the
// browser as a download.
export async function downloadFile(
  path: string,
  filename: string,
): Promise<void> {
  const token = getToken();
  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch {
    throw new ApiError(0, 'Network error');
  }

  if (!response.ok) {
    throw new ApiError(response.status, 'Download failed');
  }

  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// Offers a text the application already has, such as the accounts that an
// import has just created, as a file.
export function downloadText(text: string, filename: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
