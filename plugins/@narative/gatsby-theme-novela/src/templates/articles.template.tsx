import React,{ useEffect }  from "react";
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
import ArticlesTagFilter from "../sections/articles/Articles.TagFilter";

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

var selectedTags:string = 'all'


class markdownTagInfoHelper {

  public totalCounts:number;
  public resultArray:Array<any> = [];
  constructor(context:Array<any>) {
    var mdsArray = context;
    this.totalCounts = context.length;
    this.resultArray = this.generateResult(mdsArray);
  }

  private generateResult(mdsArray:Array<any>){
    var newArr:Array<any> = [];
    for(var i=0;i<mdsArray.length;i++){
      // markdown tag inside frontmatter
      // console.log( mdsArray[i].tag.toString().split(" "))
      if(mdsArray[i].frontmatter.tag != null){
        var currArticleTags = mdsArray[i].frontmatter.tag.toString().split(" ");
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
        obj['name'] = "未分类";
        obj['times'] = 1;
        newArr.splice(0,0,obj);
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

    const allTag = {
      name:"全部",
      times:mdsArray.length
    }

    result.splice(0,0,allTag);
    
    result = this.moveIndex(result, 1, result.length-1);
    return result;
  }

  moveIndex(input, from, to) {
    let numberOfDeletedElm = 1;
  
    const elm = input.splice(from, numberOfDeletedElm)[0];
  
    numberOfDeletedElm = 0;

    input.splice(to, numberOfDeletedElm, elm);
    return input;
  }

  // getter
  // getTagInfo(){
  //   var str=[];
  //   for(var i=0;i<this.resultArray.length;i++){
  //     str.push(this.resultArray[i].name.toString() + ' ' + this.resultArray[i].times.toString()+' ')
  //   }
  //   //this.resultArray
  //   return str;
  // }

  // getTotalCounts(){
  //   return this.totalCounts;
  // }
}

const ArticlesPage: Template = ({ location, pageContext }) => {
  const articles = pageContext.group;
  const authors = pageContext.additionalContext.authors;
  let tagInfo = new markdownTagInfoHelper(pageContext.mdRemarks);

  useEffect(() => {
  }, []);

  console.log(pageContext)

  return (
    <Layout>
      <SEO pathname={location.pathname} />
      <ArticlesHero authors={authors} />
      <Section narrow>
        <ArticlesTagFilter tagInfo={tagInfo}></ArticlesTagFilter>
        {/* <TagInfo>全部文章:{tagInfo.getTotalCounts()} {tagInfo.getTagInfo()}</TagInfo> */}
        <ArticlesList articles={articles} sortByTags={selectedTags}/>
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
