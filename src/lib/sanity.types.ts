export interface SanityAuthor {
  name?: string;
  position?: string;
  nickname?: string;
  bio?: string;
  linkedin?: string;
  avatar?: SanityHeroImage;
}

export interface SanityHeroImage {
  alt?: string;
  url?: string;
  width?: number;
  height?: number;
}

export interface SanityPortableTextSpan {
  _type: 'span';
  _key?: string;
  text?: string;
  marks?: string[];
}

export interface SanityPortableTextMarkDefLink {
  _key: string;
  _type: 'link';
  href?: string;
  openInNewTab?: boolean;
}

export interface SanityPortableTextMarkDefInternalLink {
  _key: string;
  _type: 'internalLink';
  slug?: string;
}

export type SanityPortableTextMarkDef =
  | SanityPortableTextMarkDefLink
  | SanityPortableTextMarkDefInternalLink;

export interface SanityPortableTextBlock {
  _type: 'block';
  _key?: string;
  style?: string;
  listItem?: 'bullet' | 'number';
  level?: number;
  markDefs?: SanityPortableTextMarkDef[];
  children?: SanityPortableTextSpan[];
}

export type SanityPortableText = SanityPortableTextBlock[];

export interface SanityPortableImageValue {
  alt?: string;
  caption?: string;
  layout?: 'inline' | 'wide' | 'full';
  url?: string;
  width?: number;
  height?: number;
}

export interface SanityPtCalloutBlock {
  _type: 'ptCalloutBlock';
  _key?: string;
  tone?: 'info' | 'warning' | 'success' | 'neutral';
  title?: string;
  content?: SanityPortableText;
}

export interface SanityPtCodeBlock {
  _type: 'ptCodeBlock';
  _key?: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  code?: string;
}

export interface SanityPtImageBlock {
  _type: 'ptImageBlock';
  _key?: string;
  image?: SanityPortableImageValue;
}

export interface SanityPtTableRow {
  _key?: string;
  cells?: string[];
}

export interface SanityPtTableBlock {
  _type: 'ptTableBlock';
  _key?: string;
  caption?: string;
  headers?: string[];
  rows?: SanityPtTableRow[];
}

export interface SanityPtEmbedBlock {
  _type: 'ptEmbedBlock';
  _key?: string;
  provider?: 'youtube' | 'vimeo' | 'iframe';
  url?: string;
  title?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1';
}

export interface SanityPtDividerBlock {
  _type: 'ptDividerBlock';
  _key?: string;
}

export type SanityPortableBodyNode =
  | SanityPortableTextBlock
  | SanityPtCalloutBlock
  | SanityPtCodeBlock
  | SanityPtImageBlock
  | SanityPtTableBlock
  | SanityPtEmbedBlock
  | SanityPtDividerBlock;

export interface SanityNumberedListItem {
  title?: string;
  description?: string;
}

export interface SanityParagraphBlock {
  _type: 'paragraphBlock';
  content?: SanityPortableText;
}

export interface SanitySubheadingBlock {
  _type: 'subheadingBlock';
  content?: string;
}

export interface SanityCalloutBlock {
  _type: 'calloutBlock';
  label?: string;
  content?: SanityPortableText;
}

export interface SanityPullquoteBlock {
  _type: 'pullquoteBlock';
  quote?: string;
  attribution?: string;
}

export interface SanityNumberedListBlock {
  _type: 'numberedListBlock';
  items?: SanityNumberedListItem[];
}

export interface SanityDividerBlock {
  _type: 'dividerBlock';
}

export type SanitySectionBlock =
  | SanityParagraphBlock
  | SanitySubheadingBlock
  | SanityCalloutBlock
  | SanityPullquoteBlock
  | SanityNumberedListBlock
  | SanityDividerBlock;

export interface SanitySection {
  tocLabel?: string;
  sectionAnchor?: {
    current?: string;
  };
  heading?: string;
  headingHighlight?: string;
  blocks?: SanitySectionBlock[];
}

export interface SanitySidebarCta {
  label?: string;
  text?: string;
  buttonText?: string;
  buttonUrl?: string;
}

export interface SanityFooterStat {
  label?: string;
  value?: string;
  emphasis?: string;
}

export interface SanityPostCardDocument {
  _id: string;
  title?: string;
  slug?: string;
  description?: string;
  category?: string;
  categorySlug?: string;
  publishedAt?: string;
  readingTimeMinutes?: number;
  image?: SanityHeroImage;
  featured?: boolean;
  author?: SanityAuthor;
  tags?: string[];
}

export interface SanityPostDocument extends SanityPostCardDocument {
  body?: SanityPortableBodyNode[];
  categoryRef?: string;
  tagRefs?: string[];
  callToAction?: {
    title?: string;
    url?: string;
  };
}

export interface SanitySlugDocument {
  slug?: string;
}

export interface SanityCategoryFilterDocument {
  title?: string;
  slug?: string;
}
