import type { SanityPortableBodyNode } from "../lib/sanity.types";

export interface BlogAuthor {
  name: string;
  position: string;
  nickname: string;
  bio: string;
  linkedin?: string;
  avatar?: BlogPostHeroImage;
}

export interface BlogSidebarCta {
  label: string;
  text: string;
  buttonText: string;
  buttonUrl: string;
}

export interface BlogFooterStat {
  label: string;
  valueHtml: string;
}

export interface BlogPostHeroImage {
  alt: string;
  url: string;
  width?: number;
  height?: number;
}

export interface NumberedListItem {
  title: string;
  description: string;
}

export type BlogBlock =
  | {
      type: "paragraph";
      content: string;
    }
  | {
      type: "subheading";
      content: string;
    }
  | {
      type: "callout";
      label: string;
      content: string;
    }
  | {
      type: "pullquote";
      quote: string;
      attribution: string;
    }
  | {
      type: "numbered-list";
      items: NumberedListItem[];
    }
  | {
      type: "divider";
    };

export interface BlogSection {
  id: string;
  tocLabel: string;
  headingHtml: string;
  blocks: BlogBlock[];
}

export interface BlogPost {
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
    title: string;
    url: string;
  };
}
