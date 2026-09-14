import type { APIRoute, AstroCookies } from 'astro';
import { previewCookie } from '../../lib/sanity.preview';

export const prerender = false;

const fallbackPath = '/blog';

function clearPreviewCookies(cookies: AstroCookies, requestUrl: URL) {
  const secure = requestUrl.protocol === 'https:';
  const options = {
    path: '/',
    secure,
    sameSite: secure ? ('none' as const) : ('lax' as const),
    partitioned: secure,
  };

  cookies.delete(previewCookie, { ...options, httpOnly: true });
  cookies.delete('rise-perspective', options);
}

function safeRedirectPath(value: FormDataEntryValue | string | null, requestUrl: URL): string {
  if (typeof value !== 'string' || !value) return fallbackPath;

  try {
    const destination = new URL(value, requestUrl.origin);
    return destination.origin === requestUrl.origin
      ? destination.pathname + destination.search + destination.hash
      : fallbackPath;
  } catch {
    return fallbackPath;
  }
}

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  clearPreviewCookies(cookies, requestUrl);
  return redirect(safeRedirectPath(formData.get('redirectTo'), requestUrl), 303);
};

export const GET: APIRoute = ({ request, cookies, redirect }) => {
  const requestUrl = new URL(request.url);
  clearPreviewCookies(cookies, requestUrl);
  return redirect(safeRedirectPath(requestUrl.searchParams.get('redirectTo'), requestUrl), 307);
};
