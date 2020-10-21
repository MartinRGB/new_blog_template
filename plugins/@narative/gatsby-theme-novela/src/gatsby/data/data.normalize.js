/* eslint-disable */

/**
 * In order to improve the authoring experience we'll set a fallback for hero images
 * when they're not provided. This will allow you to write articles without immediately
 * adding a hero image.
 *
 * @param {Object} heroSource
 */
function normalizeHero(article) {
  let hero = {
    full: {},
    regular: {},
    narrow: {},
    seo: {},
  };

  if (article.hero) {
    hero = {
      full: article.hero.full.fluid,
      regular: article.hero.regular.fluid,
      narrow: article.hero.narrow.fluid,
      seo: article.hero.seo.fixed,
    };
  } 
  // else {
  //   console.log('\u001B[33m', `Missing hero for "${article.title}"`);
  // }

  return hero;
}

function normalizeAvatar(author) {
  let avatar = {
    small: {},
    medium: {},
    large: {},
  };

  if (author.avatar) {
    avatar = {
      small: author.avatar.small.fluid,
      medium: author.avatar.medium.fluid,
      large: author.avatar.large.fluid,
    };
  } else {
    console.log('\u001B[33m', `Missing avatar for "${author.name}"`);
  }

  return avatar;
}

function normalizeTags(markdownRemark) {
  let tag = {};

  if (markdownRemark.frontmatter.tag) {
    tag = markdownRemark.frontmatter.tag;
  } 

  return tag;
}

function normalizeHeadings(markdownRemark) {
  let headings = {
    name: {},
  };

  if (markdownRemark.headings) {
    headings = markdownRemark.headings;
  } 

  return headings;
}

module.exports.local = {
  articles: ({ node: article }) => {
    return {
      ...article,
      hero: normalizeHero(article),
    };
  },
  authors: ({ node: author }) => {
    return {
      ...author,
      avatar: normalizeAvatar(author),
    };
  },
  markdownRemarks: ({ node: markdownRemark }) => {
    return {
      ...markdownRemark,
      tag: normalizeTags(markdownRemark),
      headings:normalizeHeadings(markdownRemark),
    };
  },
};

module.exports.contentful = {
  articles: ({ node: article }) => {
    const author = article.author.reduce((curr, next, index, array) => {
      if (array.length === 1) {
        return next.name;
      }

      return `${curr + next.name}, `;
    }, ``);

    return {
      ...article,
      author,
      body: article.body.childMdx.body,
      timeToRead: article.body.childMdx.timeToRead,
    };
  },
  authors: ({ node: author }) => {
    return {
      ...author,
      social: author.social.map(s => ({ url: s })),
      slug: author.fields.slug,
      authorsPage: author.fields.authorsPage,
    };
  },

  markdownRemarks: ({ node: markdownRemark }) => {
    return {
      ...markdownRemark,
      tag: normalizeTags(markdownRemark),
      headings:normalizeHeadings(markdownRemark),
    };
  },
};
