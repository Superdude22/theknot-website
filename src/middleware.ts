import type { MiddlewareHandler } from 'astro';

function getRequestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

export const onRequest: MiddlewareHandler = async (context, next) => {
  const url = new URL(context.request.url);
  const isKeystaticRoute =
    url.pathname.startsWith('/api/keystatic/github/') || url.pathname.startsWith('/keystatic');

  if (!isKeystaticRoute) return next();

  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (input, init) => {
    const response = await originalFetch(input, init);

    try {
      const requestUrl = getRequestUrl(input);
      if (requestUrl.startsWith('https://github.com/login/oauth/access_token')) {
        const clone = response.clone();
        const text = await clone.text();
        let parsed: unknown = text;
        try {
          parsed = JSON.parse(text);
        } catch {
          // keep as text
        }

        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          const obj = parsed as Record<string, unknown>;
          if (typeof obj.access_token === 'string') obj.access_token = 'REDACTED';
          if (typeof obj.refresh_token === 'string') obj.refresh_token = 'REDACTED';
          parsed = obj;
        }

        console.log('[keystatic] github access_token response', {
          status: response.status,
          ok: response.ok,
          data: parsed,
        });
      }
    } catch (err) {
      console.log('[keystatic] oauth debug failed', String(err));
    }

    return response;
  };

  try {
    return await next();
  } finally {
    globalThis.fetch = originalFetch;
  }
};

