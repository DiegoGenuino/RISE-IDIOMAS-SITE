import { createDataAttribute } from '@sanity/visual-editing-standalone';

export function previewAttribute(enabled: boolean, id: string | undefined, field = 'title') {
  if (!enabled || !id) return undefined;
  return createDataAttribute({
    id: id.replace(/^drafts\./, ''),
    type: 'post',
    path: field,
    projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
    dataset: import.meta.env.PUBLIC_SANITY_DATASET,
  }).toString();
}
