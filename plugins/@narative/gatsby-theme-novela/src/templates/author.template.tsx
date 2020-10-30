import React from "react";
import styled from "@emotion/styled";

import Section from "@components/Section";
import SEO from "@components/SEO";
import Layout from "@components/Layout";
import Paginator from "@components/Navigation/Navigation.Paginator";

import AuthorHero from "../sections/author/Author.Hero";
import AuthorArticles from "../sections/author/Author.Articles";

import { Template } from "@types";
import mediaqueries from '@styles/media';

const ArticlesPage: Template = ({ location, pageContext }) => {
  const author = pageContext.additionalContext.author;
  const articles = pageContext.group;

  return (
    <Layout>
      <SEO
        pathname={location.pathname}
        title={author.name}
        description={author.bio}
      />
      <Section narrow>
        <AuthorHero author={author} />
        <AuthorArticles pageContext={pageContext} />
        <AuthorPaginatorContainer show={pageContext.pageCount >= 1}>
          <Paginator {...pageContext} />
        </AuthorPaginatorContainer>

      </Section>
      <AuthorsGradient />
    </Layout>
  );
}

export default ArticlesPage;

const AuthorsGradient = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 590px;
  z-index: 0;
  pointer-events: none;
  background: ${p => p.theme.colors.gradient};
  transition: ${p => p.theme.colorModeTransition};
`;

const AuthorPaginatorContainer = styled.div<{ show: boolean }>`
  ${p => p.show && `margin-top: 40px;`}
  ${mediaqueries.phablet`
    margin-top:40px;
    padding-left: 1em;
  `}
`;

