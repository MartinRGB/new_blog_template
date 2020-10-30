module.exports = {
  siteMetadata: {
    title: `Martin's Graphic Notes`,
    name: `Martin's Graphic Notes`,
    siteUrl: `http://www.martinrgb.com/blog/`,
    description: `This is my description that will be used in the meta tags and important for search results`,
    hero: {
      heading: `Welcome to Novela, the simplest way to start publishing with Gatsby.`,
      maxWidth: 652,
    },

    social: [
      {
        name: `twitter`,
        url: `//twitter.com/qiuyinsen`,
      },
      {
        name: `github`,
        url: `https://github.com/MartinRGB`,
      },
      {
        name: `dribbble`,
        url: `https://dribbble.com/MartinRGB`,
      },
    ],
  },
  plugins: [
    {
      // resolve: "@narative/gatsby-theme-novela",
      resolve: "./plugins/@narative/gatsby-theme-novela",
      options: {
        contentPosts: "content/posts",
        contentAuthors: "content/authors",
        basePath: "/",
        authorsPage: true,
        sources: {
          local: true,
          // contentful: true,
        },
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Novela by Narative`,
        short_name: `Novela`,
        start_url: `/`,
        background_color: `#fff`,
        theme_color: `#fff`,
        display: `standalone`,
        icon: `src/assets/favicon.png`,
      },
    },
    {
      resolve: `gatsby-plugin-netlify-cms`,
      options: {
      },
    },
    {
      resolve: 'gatsby-plugin-tinacms',
      options: {
        // The CMS will be disabled on your production site
        enabled: process.env.NODE_ENV !== 'production',
        sidebar: true,
        plugins: [
          // We'll add some gatsby-tinacms plugins later
        ],
      },
    },
  ],
};
