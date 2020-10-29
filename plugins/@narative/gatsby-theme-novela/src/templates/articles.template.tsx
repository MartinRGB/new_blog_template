import React,{ useEffect,useContext}  from "react";
import styled from "@emotion/styled";
import {css} from "@emotion/core";
import { graphql, useStaticQuery } from "gatsby";

import Section from "@components/Section";
import SEO from "@components/SEO";
import Layout from "@components/Layout";
import Paginator from "@components/Navigation/Navigation.Paginator";
import mediaqueries from '@styles/media';

import ArticlesHero from "../sections/articles/Articles.Hero";
import ArticlesList from "../sections/articles/Articles.List";
import ArticlesTag from "../sections/articles/Articles.Tag";
import SelectedTagProvider from "../sections/articles/Articles.Tag.Context";

import tw from 'twin.macro'

import { Template } from "@types";

// const ContainerParent = tw.div`
//   bg-blue-500 w-full
// `

// const Container = styled.div`
//     ${tw`bg-red-500 w-full`}
//     padding: 15px;
// `

const ArticlesPage: Template = ({ location, pageContext }) => {
  const articles = pageContext.group;
  const authors = pageContext.additionalContext.authors;
  const tags = pageContext.allTags;
  //let tagInfo = new markdownTagInfoHelper(pageContext.allTags);

  useEffect(() => {
  }, []);

  return (
    <Layout>
      <SEO pathname={location.pathname} />
      <ArticlesHero authors={authors} />
      <SelectedTagProvider>
        <Section narrow>
          <ArticlesTag tags={tags}></ArticlesTag>
          <ArticlesList articles={articles} tags={tags}/>
          <ArticlesPaginator show={pageContext.pageCount >= 1}>
            <Paginator {...pageContext}/>
          </ArticlesPaginator>
        </Section>
      </SelectedTagProvider>
      <ArticlesGradient />
    </Layout>
  );
};

export default ArticlesPage;

const TagInfo = styled.div`
  font-size: 14px;
  line-height: 1.45;
  color: var(--theme-ui-colors-grey,#73737D);
  position: relative;
  display: block;
  overflow: hidden;
  margin-bottom: 40px;
`

const ArticlesGradient = styled.div`
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

const ArticlesPaginator = styled.div<{ show: boolean }>`
  ${p => p.show && `margin-top: 40px;`}
  ${mediaqueries.phablet`
    margin-top:40px;
    padding-left: 1em;
  `}
`;


const slugify = function(str){
  str = str.replace(/\s+/g,'-') // replace spaces with dashes
  //str = str.replace(/[^a-zA-Z0-9_\u3400-\u9FBF\s-]/g,'');
  //str = str.replace(/[\!@#\$%^&\*\)]/g,'');
  //str = encodeURIComponent(str) // encode (it encodes chinese characters)
  return str
}