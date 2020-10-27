module.exports = ({ actions }) => {
  actions.createTypes(`
    type Article implements Node {
      id: ID!
      slug: String!
      title: String!
      date: Date! @dateformat
      author: String!
      tags: [String]
      headings: String
      excerpt(pruneLength: Int = 560): String!
      body: String!
      hero: File @fileByRelativePath
      timeToRead: Int
      canonical_url: String
    }
  `);
};
