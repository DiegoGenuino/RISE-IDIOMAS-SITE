// all available routes must be included here, else the endpoint is redirected to 404
export const shareRoutes: Record<string, { to: string; title?: string }> = {
  rise: {
    to: '/',
    title: 'Rise Idiomas',
  },
};
