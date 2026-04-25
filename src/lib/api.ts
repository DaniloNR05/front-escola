const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

function normalizeBaseUrl(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function getApiUrl(path: string) {
  if (!configuredApiUrl) {
    return path;
  }

  const normalizedBaseUrl = normalizeBaseUrl(configuredApiUrl);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBaseUrl}${normalizedPath}`;
}
