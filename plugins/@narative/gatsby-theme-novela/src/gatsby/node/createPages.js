/* eslint-disable no-console, import/no-extraneous-dependencies, prefer-const, no-shadow */

require('dotenv').config();

const log = (message, section) =>
  console.log(`\n\u001B[36m${message} \u001B[4m${section}\u001B[0m\u001B[0m\n`);

const path = require('path');
const createPaginatedPages = require('gatsby-paginate');

const templatesDirectory = path.resolve(__dirname, '../../templates');
const templates = {
  articles: path.resolve(templatesDirectory, 'articles.template.tsx'),
  article: path.resolve(templatesDirectory, 'article.template.tsx'),
  author: path.resolve(templatesDirectory, 'author.template.tsx'),
};

const query = require('../data/data.query');
const normalize = require('../data/data.normalize');

// ///////////////// Utility functions ///////////////////

function buildPaginatedPath(index, basePath) {
  // if (basePath === '/') {
  //   return index > 1 ? `${basePath}page/${index}` : basePath;
  // }
  // return index > 1 ? `${basePath}/page/${index}` : basePath;
  if (basePath === '/') {
    return index > 1 ? `${basePath}page/${index}` : `${basePath}page/1`;
  }
  return index > 1 ? `${basePath}/page/${index}` : `${basePath}/page/1`;

}

function slugify(string, base) {
  const slug = string
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036F]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  return `${base}/${slug}`.replace(/\/\/+/g, '/');
}

function getUniqueListBy(array, key) {
  return [...new Map(array.map(item => [item[key], item])).values()];
}

const byDate = (a, b) => new Date(b.dateForSEO) - new Date(a.dateForSEO);

// ///////////////////////////////////////////////////////

module.exports = async ({ actions: { createPage }, graphql }, themeOptions) => {
  const {
    rootPath,
    basePath = '/',
    articlePath = '/articles',
    authorsPath = '/authors',
    tagPath = '/tag',
    authorsPage = true,
    pageLength = 12,
    sources = {},
    mailchimp = '',
  } = themeOptions;

  const { data } = await graphql(`
    query siteQuery {
      site {
        siteMetadata {
          siteUrl
        }
      }
    }
  `);

  console.log(sources);
  // Defaulting to look at the local MDX files as sources.
  const { local = true, contentful = false } = sources;

  let authors;
  let articles;
  let headings;
  let tags;

  const dataSources = {
    local: { authors: [], articles: [], headings: [], tags:[] },
    contentful: { authors: [], articles: [], headings: [], tags:[] },
    netlify: { authors: [], articles: [], headings: [], tags:[] },
  };

  if (rootPath) {
    log('Config rootPath', rootPath);
  } else {
    log('Config rootPath not set, using basePath instead =>', basePath);
  }

  log('Config basePath', basePath);
  if (authorsPage) log('Config authorsPath', authorsPath);

  if (local) {
    try {
      log('Querying Authors & Articles source:', 'Local');
      const localAuthors = await graphql(query.local.authors);
      const localArticles = await graphql(query.local.articles);
      const localMarkDownRemarks= await graphql(query.local.markdownRemarks);
      dataSources.local.authors = localAuthors.data.authors.edges.map(
        normalize.local.authors,
      );

      dataSources.local.articles = localArticles.data.articles.edges.map(
        normalize.local.articles,
      );

      dataSources.local.headings = localMarkDownRemarks.data.markdownRemarks.edges.map(
        normalize.local.headings,
      );

      dataSources.local.tags = localMarkDownRemarks.data.markdownRemarks.edges.map(
        normalize.local.tags,
      );

    } catch (error) {
      console.error(error);
    }
  }

  if (contentful) {
    try {
      log('Querying Authors & Articles source:', 'Contentful');
      const contentfulAuthors = await graphql(query.contentful.authors);
      const contentfulArticles = await graphql(query.contentful.articles);
      const contentfulMarkDownRemarks = await graphql(query.contentful.markdownRemarks);

      dataSources.contentful.authors = contentfulAuthors.data.authors.edges.map(
        normalize.contentful.authors,
      );

      dataSources.contentful.articles = contentfulArticles.data.articles.edges.map(
        normalize.contentful.articles,
      );


      dataSources.contentful.headings = contentfulMarkDownRemarks.data.markdownRemarks.edges.map(
        normalize.contentful.headings,
      );

      dataSources.contentful.tags = contentfulMarkDownRemarks.data.markdownRemarks.edges.map(
        normalize.contentful.tags,
      );


    } catch (error) {
      console.error(error);
    }
  }

  // Combining together all the articles from different sources
  headings = [
    ...dataSources.local.headings,
    ...dataSources.contentful.headings,
    ...dataSources.netlify.headings,
  ].sort(byDate);

  articles = [
    ...dataSources.local.articles,
    ...dataSources.contentful.articles,
    ...dataSources.netlify.articles,
  ].sort(byDate);

  tags = [
    ...dataSources.local.tags,
    ...dataSources.contentful.tags,
    ...dataSources.netlify.tags,
  ].sort(byDate);


  
  articles.forEach((article, index) => {
    log('article' + index.toString(), article);
    log('tag' + index.toString(), tags[index]);
  });

  const articlesThatArentSecret = articles.filter(article => !article.secret);
  // Combining together all the authors from different sources
  authors = getUniqueListBy(
    [
      ...dataSources.local.authors,
      ...dataSources.contentful.authors,
      ...dataSources.netlify.authors,
    ],
    'name',
  );

  if (articles.length === 0 || authors.length === 0) {
    throw new Error(`
    You must have at least one Author and Post. As reference you can view the
    example repository. Look at the content folder in the example repo.
    https://github.com/narative/gatsby-theme-novela-example
  `);
  }

  /**
   * Once we've queried all our data sources and normalized them to the same structure
   * we can begin creating our pages. First, we'll want to create all main articles pages
   * that have pagination.
   * /articles
   * /articles/page/1
   * ...
   */

  // TODO: grab data from graphQL
  // TODO: optim basePath
  const path = slugify('all', tagPath);
  var newPath = path + basePath;
  newPath = newPath.substring(0,newPath.length - 1);

  log('path',newPath);

  log('Creating', 'articles page');
  createPaginatedPages({
    edges: articlesThatArentSecret,
    pathPrefix: newPath,
    createPage,
    pageLength,
    pageTemplate: templates.articles,
    buildPath: buildPaginatedPath,
    context: {
      authors,
      newPath,
      allTags: tags,
      allHeadings: headings,
      articleCounts: articles.length,
      skip: pageLength,
      limit: pageLength,
    },
  });

  /**
   * Once the list of articles have bene created, we need to make individual article posts.
   * To do this, we need to find the corresponding authors since we allow for co-authors.
   */
  log('Creating', 'article posts');
  articles.forEach((article, index) => {
    // Match the Author to the one specified in the article
    let authorsThatWroteTheArticle;
    try {
      authorsThatWroteTheArticle = authors.filter(author => {
        const allAuthors = article.author
          .split(',')
          .map(a => a.trim().toLowerCase());

        return allAuthors.some(a => a === author.name.toLowerCase());
      });
    } catch (error) {
      throw new Error(`
        We could not find the Author for: "${article.title}".
        Double check the author field is specified in your post and the name
        matches a specified author.
        Provided author: ${article.author}
        ${error}
      `);
    }

    /**
     * We need a way to find the next artiles to suggest at the bottom of the articles page.
     * To accomplish this there is some special logic surrounding what to show next.
     */
    let next = articlesThatArentSecret.slice(index + 1, index + 3);
    // If it's the last item in the list, there will be no articles. So grab the first 2
    if (next.length === 0) next = articlesThatArentSecret.slice(0, 2);
    // If there's 1 item in the list, grab the first article
    if (next.length === 1 && articlesThatArentSecret.length !== 2)
      next = [...next, articlesThatArentSecret[0]];
    if (articlesThatArentSecret.length === 1) next = [];

    createPage({
      path: article.slug,
      component: templates.article,
      context: {
        article,
        authors: authorsThatWroteTheArticle,
        articlePath,
        permalink: `${data.site.siteMetadata.siteUrl}${article.slug}/`,
        slug: article.slug,
        id: article.id,
        title: article.title,
        tag: tags[index],
        heading: headings[index],
        canonicalUrl: article.canonical_url,
        mailchimp,
        next,
      },
    });
  });

  /**
   * By default the author's page is not enabled. This can be enabled through the theme options.
   * If enabled, each author will get their own page and a list of the articles they have written.
   */
  if (authorsPage) {
    log('Creating', 'authors page');

    authors.forEach(author => {
      const articlesTheAuthorHasWritten = articlesThatArentSecret.filter(
        article =>
          article.author.toLowerCase().includes(author.name.toLowerCase()),
      );
      const path = slugify(author.slug, authorsPath);

      createPaginatedPages({
        edges: articlesTheAuthorHasWritten,
        pathPrefix: author.slug,
        createPage,
        pageLength,
        pageTemplate: templates.author,
        buildPath: buildPaginatedPath,
        context: {
          author,
          originalPath: path,
          skip: pageLength,
          limit: pageLength,
        },
      });
    });
  }
};
