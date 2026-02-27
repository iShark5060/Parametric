let cachedToken: string | null = null;
let inFlightPromise: Promise<string | null> | null = null;
let csrfTokenGeneration = 0;
let authRedirectPending = false;

function currentAppPath(): string {
  const { pathname, search, hash } = window.location;
  return `${pathname}${search}${hash}`;
}

export function buildCentralAuthLoginUrl(nextPath?: string): string {
  const next = nextPath && nextPath.length > 0 ? nextPath : currentAppPath();
  return `/api/auth/login?next=${encodeURIComponent(next)}`;
}

export function redirectToCentralAuth(nextPath?: string): void {
  if (authRedirectPending) return;
  authRedirectPending = true;
  window.location.href = buildCentralAuthLoginUrl(nextPath);
}

async function getCsrfToken(): Promise<string | null> {
  if (cachedToken !== null) {
    return cachedToken;
  }
  if (inFlightPromise !== null) {
    return await inFlightPromise;
  }

  const generationAtStart = csrfTokenGeneration;
  inFlightPromise = (async () => {
    try {
      const res = await fetch('/api/auth/csrf');
      if (!res.ok) {
        return null;
      }
      const body = (await res.json()) as { csrfToken?: string };
      if (!body.csrfToken) {
        return null;
      }
      if (generationAtStart === csrfTokenGeneration) {
        cachedToken = body.csrfToken;
      }
      return body.csrfToken;
    } catch {
      return null;
    } finally {
      inFlightPromise = null;
    }
  })();

  const token = await inFlightPromise;
  if (token === null) {
    cachedToken = null;
  }
  return token;
}

export function clearCsrfToken(): void {
  csrfTokenGeneration += 1;
  cachedToken = null;
  inFlightPromise = null;
}

async function isCsrfFailureResponse(response: Response): Promise<boolean> {
  const csrfErrorHeader = response.headers.get('X-CSRF-Error');
  if (response.status === 403 && csrfErrorHeader === '1') {
    return true;
  }

  try {
    const body = (await response.clone().json()) as {
      code?: string;
      errorCode?: string;
      error_code?: string;
    };
    const code = body.code ?? body.errorCode ?? body.error_code;
    return response.status === 403 && code === 'CSRF_INVALID';
  } catch {
    return false;
  }
}

export async function apiFetch(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  const method = (init?.method ?? 'GET').toUpperCase();
  const needsCsrf =
    method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS';

  const headers = new Headers(init?.headers);
  if (
    !headers.has('Content-Type') &&
    init?.body &&
    typeof init.body === 'string'
  ) {
    headers.set('Content-Type', 'application/json');
  }

  if (needsCsrf) {
    const csrfToken = await getCsrfToken();
    if (csrfToken === null) {
      throw new Error('Failed to fetch CSRF token');
    }
    headers.set('X-CSRF-Token', csrfToken);
  }

  const response = await fetch(url, { ...init, headers });
  if (response.status === 401) {
    redirectToCentralAuth();
  }
  if (!needsCsrf || !(await isCsrfFailureResponse(response))) {
    return response;
  }

  clearCsrfToken();
  const freshCsrfToken = await getCsrfToken();
  if (freshCsrfToken === null) {
    throw new Error('Failed to refresh CSRF token');
  }

  const retryHeaders = new Headers(init?.headers);
  if (
    !retryHeaders.has('Content-Type') &&
    init?.body &&
    typeof init.body === 'string'
  ) {
    retryHeaders.set('Content-Type', 'application/json');
  }
  retryHeaders.set('X-CSRF-Token', freshCsrfToken);
  return fetch(url, { ...init, headers: retryHeaders });
}
