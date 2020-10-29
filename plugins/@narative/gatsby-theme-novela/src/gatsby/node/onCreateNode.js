/* eslint-disable no-prototype-builtins */

const crypto = require(`crypto`);

// TODO
const slugify = function(str){
  str = str.replace(/\s+/g,'-') // replace spaces with dashes
  //str = str.replace(/[^a-zA-Z0-9_\u3400-\u9FBF\s-]/g,'');
  //str = str.replace(/[\!@#\$%^&\*\)]/g,'');
  //str = encodeURIComponent(str) // encode (it encodes chinese characters)
  return str
}

// Create fields for post slugs and source
// This will change with schema customization with work
module.exports = ({ node, actions, getNode, createNodeId }, themeOptions) => {
  const { createNode, createNodeField, createParentChildLink } = actions;
  const contentPath = themeOptions.contentPath || 'content/posts';
  const basePath = themeOptions.basePath || '/';
  const articlePermalinkFormat = themeOptions.articlePermalinkFormat || ':slug';

  // Create source field (according to contentPath)
  const fileNode = getNode(node.parent);
  const source = fileNode && fileNode.sourceInstanceName;

  // ///////////////// Utility functions ///////////////////

  // TODO
  function generateArticlePermalink(slug, date) {
    const [year, month, day] = date.match(/\d{4}-\d{2}-\d{2}/)[0].split('-');
    const permalinkData = {
      year,
      month,
      day,
      slug,
    };

    const permalink = articlePermalinkFormat.replace(/(:[a-z_]+)/g, match => {
      const key = match.substr(1);
      if (permalinkData.hasOwnProperty(key)) {
        return permalinkData[key];
      }
      throw new Error(`
          We could not find the value for: "${key}".
          Please verify the articlePermalinkFormat format in theme options.
          https://github.com/narative/gatsby-theme-novela#theme-options
        `);
    });

    return permalink;
  }

  function generateSlug(...arguments_) {
    return `/${arguments_.join('/')}`.replace(/\/\/+/g, '/');
  }

  // ///////////////////////////////////////////////////////

  if (node.internal.type === `AuthorsYaml`) {
    const slug = node.slug
      ? `/${node.slug}`
      : slugify(node.name, {
          lower: true,
        });

    const fieldData = {
      ...node,
      authorsPage: themeOptions.authorsPage || false,
      slug: generateSlug(basePath, 'author', slug),
    };

    createNode({
      ...fieldData,
      // Required fields.
      id: createNodeId(`${node.id} >>> Author`),
      parent: node.id,
      children: [],
      internal: {
        type: `Author`,
        contentDigest: crypto
          .createHash(`md5`)
          .update(JSON.stringify(fieldData))
          .digest(`hex`),
        content: JSON.stringify(fieldData),
        description: `Author`,
      },
    });

    createParentChildLink({ parent: fileNode, child: node });

    return;
  }

  if (node.internal.type === `Mdx` && source === contentPath) {
    const fieldData = {
      author: node.frontmatter.author,
      date: node.frontmatter.date,
      hero: node.frontmatter.hero,
      secret: node.frontmatter.secret || false,
      slug: generateSlug(
        basePath,
        generateArticlePermalink(
          slugify(node.frontmatter.slug || node.frontmatter.title, {
            lower: true,
          }),
          node.frontmatter.date,
        ),
      ),
      title: node.frontmatter.title,
      tags: node.frontmatter.tags,
      headings: node.headings,
      subscription: node.frontmatter.subscription !== false,
      canonical_url: node.frontmatter.canonical_url,
    };

    console.log(fieldData)

    createNode({
      ...fieldData,
      // Required fields.
      id: createNodeId(`${node.id} >>> Article`),
      parent: node.id,
      children: [],
      internal: {
        type: `Article`,
        contentDigest: crypto
          .createHash(`md5`)
          .update(JSON.stringify(fieldData))
          .digest(`hex`),
        content: JSON.stringify(fieldData),
        description: `Article Posts`,
      },
    });

    createParentChildLink({ parent: fileNode, child: node });
  }

  if (node.internal.type === `ContentfulAuthor`) {
    createNodeField({
      node,
      name: `slug`,
      value: generateSlug(
        basePath,
        'author',
        slugify(node.name, {
          lower: true,
        }),
      ),
    });

    createNodeField({
      node,
      name: `authorsPage`,
      value: themeOptions.authorsPage || false,
    });
  }
};
