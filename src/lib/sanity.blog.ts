import type { BlogPost } from '../types/blog';
import {
  BLOG_CATEGORY_FILTERS_QUERY,
  BLOG_POST_BY_SLUG_QUERY,
  BLOG_POST_LIST_QUERY,
  BLOG_POST_SLUGS_QUERY,
  BLOG_RELATED_POSTS_QUERY,
  BLOG_RECENT_POSTS_QUERY,
} from './sanity.queries';
import { isSanityConfigured, sanityClient } from './sanity.client';
import { loadSanityQuery } from './sanity.loader';
import { stegaClean } from '@sanity/client/stega';
import type {
  SanityCategoryFilterDocument,
  SanityPostCardDocument,
  SanityPostDocument,
  SanitySlugDocument,
} from './sanity.types';
import { mapSanityPost, mapSanityPostCard, sortPostsByDate } from './blog.mapper';

const BLOG_LOAD_ERROR_MESSAGE = 'Nao foi possivel carregar os artigos do CMS no momento.';
const SANITY_CONFIG_ERROR_MESSAGE = 'Sanity nao esta configurado neste ambiente.';

export interface BlogListResult {
  posts: BlogPost[];
  categoryFilters: string[];
  errorMessage: string | null;
}

export interface BlogDetailResult {
  post?: BlogPost;
  relatedPosts: BlogPost[];
  errorMessage: string | null;
}

async function fetchPublishedPostCards(isPreview = false): Promise<SanityPostCardDocument[]> {
  if (!sanityClient) {
    return [];
  }

  return loadSanityQuery<SanityPostCardDocument[]>(BLOG_POST_LIST_QUERY, {}, isPreview);
}

async function fetchPublishedCategoryFilters(
  isPreview = false
): Promise<SanityCategoryFilterDocument[]> {
  if (!sanityClient) {
    return [];
  }

  return loadSanityQuery<SanityCategoryFilterDocument[]>(
    BLOG_CATEGORY_FILTERS_QUERY,
    {},
    isPreview
  );
}

export async function getBlogList(isPreview = false): Promise<BlogListResult> {
  if (!isSanityConfigured || !sanityClient) {
    return {
      posts: [],
      categoryFilters: [],
      errorMessage: SANITY_CONFIG_ERROR_MESSAGE,
    };
  }

  try {
    const [sanityPosts, sanityCategoryFilters] = await Promise.all([
      fetchPublishedPostCards(isPreview),
      fetchPublishedCategoryFilters(isPreview).catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Erro ao buscar categorias de filtro no Sanity', error);
        return [];
      }),
    ]);

    const mappedPosts = sanityPosts.map(mapSanityPostCard);
    const fallbackCategoryFilters = Array.from(
      new Set(mappedPosts.map((post) => post.category).filter(Boolean))
    );
    const categoryFilters = Array.from(
      new Set(
        sanityCategoryFilters
          .map((categoryFilter) => categoryFilter.title?.trim())
          .filter(Boolean) as string[]
      )
    );

    return {
      posts: sortPostsByDate(mappedPosts),
      categoryFilters: categoryFilters.length > 0 ? categoryFilters : fallbackCategoryFilters,
      errorMessage: null,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Erro ao buscar listagem de posts no Sanity', error);
    return {
      posts: [],
      categoryFilters: [],
      errorMessage: BLOG_LOAD_ERROR_MESSAGE,
    };
  }
}

export async function getBlogSlugs(): Promise<string[]> {
  if (!isSanityConfigured || !sanityClient) {
    return [];
  }

  try {
    const slugDocuments = await loadSanityQuery<SanitySlugDocument[]>(BLOG_POST_SLUGS_QUERY);
    const slugs = slugDocuments.map((item) => item.slug).filter(Boolean) as string[];
    return slugs;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Erro ao buscar slugs de posts no Sanity', error);
    return [];
  }
}

async function getAutomaticRelatedPosts(
  post: SanityPostDocument,
  isPreview = false
): Promise<BlogPost[]> {
  if (!sanityClient || !post.slug) {
    return [];
  }

  const params = {
    slug: stegaClean(post.slug),
    categoryRef: stegaClean(post.categoryRef || ''),
    tagRefs: (post.tagRefs || []).map((tagRef) => stegaClean(tagRef)),
    limit: 3,
  };

  const relatedCards = await loadSanityQuery<SanityPostCardDocument[]>(
    BLOG_RELATED_POSTS_QUERY,
    params,
    isPreview
  );

  if (relatedCards.length > 0) {
    return relatedCards.map(mapSanityPostCard).slice(0, 3);
  }

  const recentCards = await loadSanityQuery<SanityPostCardDocument[]>(
    BLOG_RECENT_POSTS_QUERY,
    {
      slug: stegaClean(post.slug),
      limit: 3,
    },
    isPreview
  );

  return recentCards.map(mapSanityPostCard).slice(0, 3);
}

export async function getBlogPostBySlug(
  slug: string,
  isPreview: boolean = false
): Promise<BlogDetailResult> {
  if (!isSanityConfigured || !sanityClient) {
    return {
      post: undefined,
      relatedPosts: [],
      errorMessage: SANITY_CONFIG_ERROR_MESSAGE,
    };
  }

  try {
    const sanityPost = await loadSanityQuery<SanityPostDocument | null>(
      BLOG_POST_BY_SLUG_QUERY,
      {
        slug,
      },
      isPreview
    );

    if (!sanityPost) {
      return {
        post: undefined,
        relatedPosts: [],
        errorMessage: null,
      };
    }

    const post = mapSanityPost(sanityPost);
    const relatedPosts: BlogPost[] = await getAutomaticRelatedPosts(sanityPost, isPreview);

    return {
      post,
      relatedPosts,
      errorMessage: null,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Erro ao buscar post ${slug} no Sanity`, error);
    return {
      post: undefined,
      relatedPosts: [],
      errorMessage: BLOG_LOAD_ERROR_MESSAGE,
    };
  }
}
