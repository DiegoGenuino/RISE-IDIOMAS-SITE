import type { APIRoute } from "astro";
import { validatePreviewUrl } from "@sanity/preview-url-secret";
import { sanityClient } from "../../lib/sanity.client";

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  if (!sanityClient) {
    return new Response("Sanity client not configured", { status: 500 });
  }

  const { isValid, redirectTo = "/" } = await validatePreviewUrl(
    sanityClient,
    request.url,
  );

  if (!isValid) {
    return new Response("Invalid preview secret", { status: 401 });
  }

  cookies.set("sanity-preview", "1", {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    secure: true,
  });

  return redirect(redirectTo);
};
