import type {
  SanityAuthor,
  SanityHeroImage,
  SanityPostCardDocument,
  SanityPostDocument,
} from './sanity.types';
import type { BlogAuthor, BlogPostHeroImage, BlogPost } from '../types/blog';
import { stegaClean } from '@sanity/client/stega';

const DATE_MONTH_LABELS = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

const defaultAuthor: BlogAuthor = {
  name: 'Equipe Rise Idiomas',
  position: 'Editores Rise',
  nickname: 'RI',
  bio: 'Conteudo produzido pelo time da Rise Idiomas.',
  linkedin: 'https://www.linkedin.com/company/riseidiomas/',
};

function formatPublishDate(isoDate?: string): { date: string; label: string } {
  if (!isoDate) {
    return {
      date: new Date().toISOString().slice(0, 10),
      label: 'Sem data',
    };
  }

  const parsed = new Date(stegaClean(isoDate));
  if (Number.isNaN(parsed.getTime())) {
    return {
      date: new Date().toISOString().slice(0, 10),
      label: 'Sem data',
    };
  }

  const day = String(parsed.getUTCDate()).padStart(2, '0');
  const month = DATE_MONTH_LABELS[parsed.getUTCMonth()] || '';
  const year = String(parsed.getUTCFullYear());

  return {
    date: parsed.toISOString().slice(0, 10),
    label: `${day} ${month} ${year}`,
  };
}

function mapAuthor(author?: SanityAuthor): BlogAuthor {
  if (!author?.name || !author.position || !author.bio) {
    return defaultAuthor;
  }

  const fallbackNickname = stegaClean(author.name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  return {
    name: author.name,
    position: author.position,
    nickname: author.nickname || fallbackNickname,
    bio: author.bio,
    linkedin: author.linkedin ? stegaClean(author.linkedin) : undefined,
    avatar: mapHeroImage(author.avatar, `Foto de ${stegaClean(author.name)}`),
  };
}

function mapHeroImage(
  heroImage?: SanityHeroImage,
  fallbackAlt = 'Imagem do artigo'
): BlogPostHeroImage | undefined {
  if (!heroImage?.url) {
    return undefined;
  }

  return {
    alt: stegaClean(heroImage.alt || fallbackAlt),
    url: stegaClean(heroImage.url),
    width: heroImage.width,
    height: heroImage.height,
  };
}

function mapBasePostData(post: SanityPostCardDocument): BlogPost {
  const publishDate = formatPublishDate(post.publishedAt);
  const category = post.category || 'Sem categoria';
  const description = post.description || 'Novo conteudo em breve.';

  return {
    id: post._id,
    slug: post.slug ? stegaClean(post.slug) : 'sem-slug',
    title: post.title || 'Post sem titulo',
    featured: Boolean(post.featured),
    description,
    category,
    publishDate: publishDate.date,
    publishDateLabel: publishDate.label,
    readingTimeMinutes: post.readingTimeMinutes || 1,
    image: mapHeroImage(post.image, `Capa do post ${stegaClean(post.title || 'artigo')}`),
    portableBody: [],
    author: mapAuthor(post.author),
    tags: (post.tags || []).filter(Boolean),
  };
}

export function mapSanityPostCard(post: SanityPostCardDocument): BlogPost {
  return mapBasePostData(post);
}

export function mapSanityPost(post: SanityPostDocument): BlogPost {
  const baseData = mapBasePostData(post);

  return {
    ...baseData,
    portableBody: post.body && post.body.length > 0 ? post.body : [],
    callToAction:
      post.callToAction?.label && post.callToAction?.url
        ? {
            label: post.callToAction.label,
            url: stegaClean(post.callToAction.url),
            openInNewTab: Boolean(post.callToAction.openInNewTab),
          }
        : undefined,
  };
}

export function sortPostsByDate(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((firstPost, secondPost) => {
    return new Date(secondPost.publishDate).getTime() - new Date(firstPost.publishDate).getTime();
  });
}
