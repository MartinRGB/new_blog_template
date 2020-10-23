import React from "react";
import styled from "@emotion/styled";
import { graphql, useStaticQuery } from "gatsby";

import Section from "@components/Section";
import SEO from "@components/SEO";
import Layout from "@components/Layout";
import Paginator from "@components/Navigation/Navigation.Paginator";
import mediaqueries from '@styles/media';

import ArticlesHero from "../sections/articles/Articles.Hero";
import ArticlesList from "../sections/articles/Articles.List";

import { Template } from "@types";

const tagQuery = graphql`
{
  allMarkdownRemark(sort: {fields: [frontmatter___date, frontmatter___title], order: DESC}) {
    edges {
      node {
        frontmatter {
          tag
        }
      }
    }
  }
}
`


class markdownTagInfoHelper {

  public totalCounts:number;
  public resultArray:Array<any> = [];
  constructor() {
    var mdTagsArray = useStaticQuery(tagQuery).allMarkdownRemark.edges;
    this.resultArray = this.generateResult(mdTagsArray);
    this.totalCounts = mdTagsArray.length;
  }

  private generateResult(mdTagsArr:Array<any>){
    var newArr:Array<any> = [];
    for(var i=0;i<mdTagsArr.length;i++){
      // markdown tag inside frontmatter
      if(mdTagsArr[i].node.frontmatter.tag != null){
        var currArticleTags = mdTagsArr[i].node.frontmatter.tag.toString().split(" ");
        // tag in one markdown file should not be duplicated;
        currArticleTags = Array.from(new Set(currArticleTags));
        // push a key-value object;
        for(var a=0;a<currArticleTags.length;a++){
          var currArticleTag = currArticleTags[a];
          var obj = {}
          obj['name'] = currArticleTag;
          obj['times'] = 1;
          newArr.push(obj)
        }
      }
      else{
        // push a key-value object without name;
        var obj = {}
        obj['name'] = "";
        obj['times'] = 1;
        newArr.push(obj);
      }
    }
    var result:Array<any> = [];
    // merge object with same name and merge times
    newArr.forEach(function (obj) {
      if (!this[obj.name]) {
          this[obj.name] = { name: obj.name, times: 0 };
          result.push(this[obj.name]);
      }
      this[obj.name].times += obj.times;
    }, {});
    return result;
  }

  // getter
  getTagInfo(){
    var str=[];
    for(var i=0;i<this.resultArray.length;i++){
      str.push(this.resultArray[i].name.toString() + ' ' + this.resultArray[i].times.toString()+' ')
    }
    //this.resultArray
    return str;
  }

  getTotalCounts(){
    return this.totalCounts;
  }
}

const ArticlesPage: Template = ({ location, pageContext }) => {
  const articles = pageContext.group;
  const authors = pageContext.additionalContext.authors;
  let tagInfo = new markdownTagInfoHelper();

  return (
    <Layout>
      <SEO pathname={location.pathname} />
      <ArticlesHero authors={authors} />
      <Section narrow>
        <TagInfo>全部文章:{tagInfo.getTotalCounts()} {tagInfo.getTagInfo()}</TagInfo>
        <ArticlesList articles={articles} />
        <ArticlesPaginator show={pageContext.pageCount > 1}>
          <Paginator {...pageContext} />
        </ArticlesPaginator>
      </Section>
      <ArticlesGradient />
    </Layout>
  );
};

export default ArticlesPage;

const TagInfo = styled.div`
  font-size: 14px;
  line-height: 1.45;
  color: var(--theme-ui-colors-grey,#73737D);
  height: 100px;
  position: relative;
  display: block;
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
