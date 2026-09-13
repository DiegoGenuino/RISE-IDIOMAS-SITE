import { createHmac, timingSafeEqual } from 'node:crypto';
import type { AstroCookies } from 'astro';

export const previewCookie = 'sanity-preview';
export const previewMaxAge = 60 * 60 * 8;
const secret = import.meta.env.SANITY_READ_TOKEN;

function signature(value: string): string {
  return createHmac('sha256', secret).update(value).digest('hex');
}

export function createPreviewSession(): string {
  if (!secret) throw new Error('SANITY_READ_TOKEN is required for preview');
  const expires = String(Date.now() + previewMaxAge * 1000);
  return expires + '.' + signature(expires);
}

export function isPreviewSession(cookies: AstroCookies): boolean {
  if (!secret) return false;
  const [expires, signed, extra] = (cookies.get(previewCookie)?.value || '').split('.');
  if (extra || !expires || !signed || !/^\d+$/.test(expires) || Number(expires) <= Date.now())
    return false;
  const expected = Buffer.from(signature(expires));
  const actual = Buffer.from(signed);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
