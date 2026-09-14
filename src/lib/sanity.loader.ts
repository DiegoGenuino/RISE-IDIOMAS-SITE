import type { ClientPerspective, QueryParams } from '@sanity/client';
import { createQueryStore } from '@sanity/react-loader';
import { sanityClient } from './sanity.client';

const { loadQuery, setServerClient } = createQueryStore({ client: false, ssr: true });

if (sanityClient) {
  setServerClient(sanityClient);
}

/**
 * Loads CMS data through Sanity's SSR query store. Preview requests include a
 * Content Source Map and stega-encode display strings for field-level overlays;
 * normal requests remain CDN-backed and contain no editing metadata.
 */
export async function loadSanityQuery<Result>(
  query: string,
  params: QueryParams = {},
  isPreview = false
): Promise<Result> {
  if (!sanityClient) {
    throw new Error('Sanity is not configured in this environment.');
  }

  const perspective: ClientPerspective = isPreview ? 'drafts' : 'published';
  const initial = await loadQuery<Result>(query, params, {
    perspective,
    useCdn: !isPreview,
    stega: isPreview,
  });

  return initial.data;
}
