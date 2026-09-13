import type { APIRoute } from 'astro';
import { validatePreviewUrl } from '@sanity/preview-url-secret';
import { sanityClient } from '../../lib/sanity.client';
import { createPreviewSession, previewCookie, previewMaxAge } from '../../lib/sanity.preview';

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  if (!sanityClient || !import.meta.env.SANITY_READ_TOKEN) {
    return new Response('Preview requires Sanity configuration and SANITY_READ_TOKEN', {
      status: 503,
    });
  }
  try {
    const { isValid, redirectTo = '/blog' } = await validatePreviewUrl(sanityClient, request.url);
    if (!isValid) return new Response('Invalid preview secret', { status: 401 });
    const url = new URL(request.url);
    const destination = new URL(redirectTo, url.origin);
    const secure = url.protocol === 'https:';
    cookies.set(previewCookie, createPreviewSession(), {
      path: '/',
      httpOnly: true,
      secure,
      sameSite: secure ? 'none' : 'lax',
      partitioned: secure,
      maxAge: previewMaxAge,
    });
    cookies.set('rise-perspective', 'drafts', {
      path: '/',
      secure,
      sameSite: secure ? 'none' : 'lax',
      partitioned: secure,
    });
    return redirect(
      destination.origin === url.origin ? destination.pathname + destination.search : '/blog',
      307
    );
  } catch {
    return new Response('Unable to validate preview session', { status: 503 });
  }
};
