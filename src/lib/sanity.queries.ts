import { defineQuery } from "groq";

const BLOG_CARD_PROJECTION = `
  _id,
  title,
  "slug": slug.current,
  "description": description,
  "category": category->title,
  "categorySlug": category->slug.current,
  publishedAt,
  readingTimeMinutes,
  "image": image{
    "alt": description,
    "url": image.asset->url,
    "width": image.asset->metadata.dimensions.width,
    "height": image.asset->metadata.dimensions.height
  },
  featured,
  status,
  "author": author->{
    name,
    position,
    nickname,
    bio,
    linkedin,
    "avatar": avatar{
      alt,
      "url": asset->url,
      "width": asset->metadata.dimensions.width,
      "height": asset->metadata.dimensions.height
    }
  },
  "tags": tags[]->title
`;

export const BLOG_POST_SLUGS_QUERY = defineQuery(`
  *[
    _type == "post" &&
    defined(slug.current) &&
    !(_id in path("drafts.**"))
  ]
  | order(publishedAt desc)
  {
    "slug": slug.current
  }
`);

export const BLOG_CATEGORY_FILTERS_QUERY = defineQuery(`
  *[
    _type == "category" &&
    defined(title) &&
    !(_id in path("drafts.**")) &&
    count(
      *[
        _type == "post" &&
        defined(slug.current) &&
        !(_id in path("drafts.**")) &&
        references(^._id)
      ]
    ) > 0
  ]
  | order(title asc)
  {
    title,
    "slug": slug.current
  }
`);

export const BLOG_POST_LIST_QUERY = defineQuery(`
  *[
    _type == "post" &&
    defined(slug.current) &&
    !(_id in path("drafts.**"))
  ]
  | order(featured desc, publishedAt desc)
  {
    ${BLOG_CARD_PROJECTION}
  }
`);

export const BLOG_POST_BY_SLUG_QUERY = defineQuery(`
  *[
    _type == "post" &&
    slug.current == $slug &&
    !(_id in path("drafts.**"))
  ][0]
  {
    ${BLOG_CARD_PROJECTION},
    "categoryRef": category._ref,
    "tagRefs": tags[]._ref,
    callToAction,
    body[]{
      ...,
      _type == "block" => {
        ...,
        markDefs[]{
          ...,
          _type == "internalLink" => {
            ...,
            "slug": reference->slug.current
          }
        }
      },
      _type == "ptCalloutBlock" => {
        ...,
        content[]{
          ...,
          markDefs[]{
            ...,
            _type == "internalLink" => {
              ...,
              "slug": reference->slug.current
            }
          }
        }
      },
      _type == "ptImageBlock" => {
        ...,
        image{
          alt,
          caption,
          layout,
          "url": asset->url,
          "width": asset->metadata.dimensions.width,
          "height": asset->metadata.dimensions.height
        }
      }
    }
  }
`);

export const BLOG_RELATED_POSTS_QUERY = defineQuery(`
  *[
    _type == "post" &&
    defined(slug.current) &&
    slug.current != $slug &&
    !(_id in path("drafts.**")) &&
    (
      category._ref == $categoryRef ||
      count((tags[]._ref)[@ in $tagRefs]) > 0
    )
  ]
  | order(featured desc, publishedAt desc)
  [0...$limit]
  {
    ${BLOG_CARD_PROJECTION}
  }
`);

export const BLOG_RECENT_POSTS_QUERY = defineQuery(`
  *[
    _type == "post" &&
    defined(slug.current) &&
    slug.current != $slug &&
    !(_id in path("drafts.**"))
  ]
  | order(featured desc, publishedAt desc)
  [0...$limit]
  {
    ${BLOG_CARD_PROJECTION}
  }
`);
