import type { SanityPortableBodyNode } from '../lib/sanity.types';

export interface BlogAuthor {
  name: string;
  position: string;
  nickname: string;
  bio: string;
  linkedin?: string;
  avatar?: BlogPostHeroImage;
}

export interface BlogPostHeroImage {
  alt: string;
  url: string;
  width?: number;
  height?: number;
}

export interface BlogPost {
  id?: string;
  slug: string;
  title: string;
  featured?: boolean;
  description: string;
  category: string;
  publishDate: string;
  publishDateLabel: string;
  readingTimeMinutes: number;
  image?: BlogPostHeroImage;
  portableBody?: SanityPortableBodyNode[];
  author: BlogAuthor;
  tags: string[];
  callToAction?: {
    label: string;
    url: string;
    openInNewTab: boolean;
  };
}
