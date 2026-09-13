import type { APIRoute } from 'astro';
import { sanityClient } from '../../lib/sanity.client';
import { isPreviewSession } from '../../lib/sanity.preview';

export const prerender = false;

const PREVIEW_DOCUMENTS_QUERY = `*[
  _type in ["post", "author", "category", "tag"]
]`;

export const GET: APIRoute = ({ cookies, request }) => {
  if (!isPreviewSession(cookies) || !sanityClient || !import.meta.env.SANITY_READ_TOKEN) {
    return new Response('Unauthorized', { status: 401 });
  }
  const previewClient = sanityClient.withConfig({
    useCdn: false,
    token: import.meta.env.SANITY_READ_TOKEN,
  });

  const encoder = new TextEncoder();
  let heartbeat: ReturnType<typeof setInterval> | undefined;
  let subscription: { unsubscribe: () => void } | undefined;

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: string) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${data}\n\n`));
      };

      send('ready', String(Date.now()));
      heartbeat = setInterval(() => send('heartbeat', String(Date.now())), 15_000);

      subscription = previewClient
        .listen(PREVIEW_DOCUMENTS_QUERY, {}, { includeResult: false, visibility: 'query' })
        .subscribe({
          next(update) {
            if (update.type === 'mutation') send('mutation', update.documentId);
          },
          error(error) {
            send('error', error instanceof Error ? error.message : 'Listener failed');
            controller.close();
          },
        });

      request.signal.addEventListener('abort', () => {
        if (heartbeat) clearInterval(heartbeat);
        subscription?.unsubscribe();
        controller.close();
      });
    },
    cancel() {
      if (heartbeat) clearInterval(heartbeat);
      subscription?.unsubscribe();
    },
  });

  return new Response(stream, {
    headers: {
      'Cache-Control': 'private, no-cache, no-transform',
      Connection: 'keep-alive',
      'Content-Type': 'text/event-stream',
      'X-Accel-Buffering': 'no',
    },
  });
};
