const trimTrailingSlash = (s: string) => s.replace(/\/$/, '');

const configured = trimTrailingSlash(
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '',
);

/** In dev, default to `/api` so Vite can proxy to local services. In production, set VITE_API_BASE_URL at build time. */
export const API_BASE_URL = configured || (import.meta.env.DEV ? '/api' : '');

export function apiUrl(path: string): string {
  const suffix = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE_URL) return suffix;
  return `${API_BASE_URL}${suffix}`;
}

/** Origin for Socket.IO (strip `/api` from API base, or same-origin in dev). */
export function socketOrigin(): string | undefined {
  if (!configured) return undefined;
  const origin = configured.replace(/\/api\/?$/, '');
  return origin || undefined;
}
