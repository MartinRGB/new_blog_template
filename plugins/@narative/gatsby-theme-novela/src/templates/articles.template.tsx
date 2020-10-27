import React,{ useEffect }  from "react";
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

import tw from 'twin.macro'

import { Template } from "@types";
import ArticlesTagFilter from "../sections/articles/Articles.TagFilter";

// const ContainerParent = tw.div`
//   bg-blue-500 w-full
// `

// const Container = styled.div`
//     ${tw`bg-red-500 w-full`}
//     padding: 15px;
// `

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
      if(mdsArray[i].tags != null && mdsArray[i].tags != undefined && mdsArray[i].tags != ""){
        //var currArticleTags = mdsArray[i].frontmatter.tags.toString().split(" ");
        var currArticleTags = mdsArray[i].tags;
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
    //console.log(result)
    return result;
  }

  moveIndex(input, from, to) {
    let numberOfDeletedElm = 1;
  
    const elm = input.splice(from, numberOfDeletedElm)[0];
  
    numberOfDeletedElm = 0;

    input.splice(to, numberOfDeletedElm, elm);
    return input;
  }
}

const ArticlesPage: Template = ({ location, pageContext }) => {
  const articles = pageContext.group;
  const authors = pageContext.additionalContext.authors;

  console.log(pageContext)
  let tagInfo = new markdownTagInfoHelper(pageContext.allTags);

  useEffect(() => {
  }, []);


  return (
    <Layout>
    {/* <div css={css`${tw`flex items-center justify-between px-1 py-3`}`}>
      <h1>Hello, world!</h1>
      <h2>I'm a flex item too!</h2>
    </div> */}

      <SEO pathname={location.pathname} />
      <ArticlesHero authors={authors} />
      <Section narrow>
        <ArticlesTagFilter  tagInfo={tagInfo}></ArticlesTagFilter>
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


const slugify = function(str){
  str = str.replace(/\s+/g,'-') // replace spaces with dashes
  //str = str.replace(/[^a-zA-Z0-9_\u3400-\u9FBF\s-]/g,'');
  //str = str.replace(/[\!@#\$%^&\*\)]/g,'');
  //str = encodeURIComponent(str) // encode (it encodes chinese characters)
  return str
}