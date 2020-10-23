import React, { useContext, useEffect,useState} from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/core';
import { Link } from 'gatsby';

import Headings from '@components/Headings';
import Image, { ImagePlaceholder } from '@components/Image';

import mediaqueries from '@styles/media';
import { IArticle } from '@types';

import { GridLayoutContext } from './Articles.List.Context';

/**
 * Tiles
 * [LONG], [SHORT]
 * [SHORT], [LONG]
 * [SHORT], [LONG]
 *
 * or ------------
 *
 * Rows
 * [LONG]
 * [LONG]
 * [LONG]
 */

interface ArticlesListProps {
  articles: IArticle[];
  alwaysShowAllDetails?: boolean;
}

interface ArticlesListItemProps {
  article: IArticle;
  narrow?: boolean;
}

const ArticlesList: React.FC<ArticlesListProps> = ({
  articles,
  alwaysShowAllDetails,
}) => {

  const [contentWidth, setContentWidth] = useState<number>(0);

  if (!articles) return null;

  const hasOnlyOneArticle = articles.length === 1;
  const { gridLayout = 'tiles', hasSetGridLayout, getGridLayout } = useContext(
    GridLayoutContext,
  );

  /**
   * We're taking the flat array of articles [{}, {}, {}...]
   * and turning it into an array of pairs of articles [[{}, {}], [{}, {}], [{}, {}]...]
   * This makes it simpler to create the grid we want
   */
  const articlePairs = articles.reduce((result, value, index, array) => {
    // if (index % 2 === 0) {
    //   result.push(array.slice(index, index + 2));
    // }
    result.push(array[index])
    return result;
  }, []);

  useEffect(() => {

    getGridLayout()

  }, []);


  return (
    <ArticlesListContainer id="Articles__Container"
      style={{ opacity: hasSetGridLayout ? 1 : 0 }}
      alwaysShowAllDetails={alwaysShowAllDetails}
      gridlayout={gridLayout}
    >
      {articlePairs.map((el,index) =>{
        const listIndex = index;

        return (
          <List
            key={index}
            gridlayout={gridLayout}
            hasOnlyOneArticle={hasOnlyOneArticle}
            reverse={false}
            listIndex={listIndex}
          >
            <ListItem article={el} narrow={false} />
          </List>
        );
      })}
      {/* {articlePairs.map((ap, index) => {
        const isEven = index % 2 !== 0;
        const isOdd = index % 2 !== 1;

        return (
          <List
            key={index}
            gridlayout={gridLayout}
            hasOnlyOneArticle={hasOnlyOneArticle}
            reverse={isEven}
          >
            <ListItem article={ap[0]} narrow={isEven} />
            <ListItem article={ap[1]} narrow={isOdd} />
          </List>
        );
      })} */}
    </ArticlesListContainer>
  );
};

export default ArticlesList;

const ListItem: React.FC<ArticlesListItemProps> = ({ article, narrow }) => {
  if (!article) return null;


  const { gridLayout } = useContext(GridLayoutContext);
  const hasOverflow = narrow && article.title.length > 35;
  const imageSource = narrow ? article.hero.narrow : article.hero.regular;
  const hasHeroImage =
    imageSource &&
    Object.keys(imageSource).length !== 0 &&
    imageSource.constructor === Object;

  var tagArray;
  var tagString = ''
  if(article.tag != null || article.tag != undefined){
    tagArray = article.tag.toString().split(" ")
    for(var i=0;i<tagArray.length;i++){
      tagString += '#' + tagArray[i].toString() + ' ';
    }
  }

  return (
    <ArticleLink to={article.slug} gridlayout={gridLayout} data-a11y="false">
      
        
        {gridLayout === 'simplest'?
          (<Item gridlayout={gridLayout} hasheroimage={hasHeroImage}>

              <TopContainer gridlayout={gridLayout}>
                <MetaData gridlayout={gridLayout} isTop={true}>
                  <TagData gridlayout={gridLayout}>{tagString}</TagData>
                </MetaData>
                <Title dark hasOverflow={hasOverflow} gridLayout={gridLayout}>
                  {article.title}
                </Title>
              </TopContainer>
              <MetaData gridlayout={gridLayout} isTop={true}>
                  <DateData gridlayout={gridLayout}>{article.date} · {article.timeToRead} min read</DateData>
              </MetaData>
          </Item>)
          :
          ( 
            <Item gridlayout={gridLayout} hasheroimage={hasHeroImage}>
              <TopContainer gridlayout={gridLayout}>
                {gridLayout === 'tiles' ? 
                  <div></div>: 
                  <MetaData gridlayout={gridLayout} isTop={true}>
                    <TagData gridlayout={gridLayout}>{tagString}</TagData>
                  </MetaData>
                }
                <Title dark hasOverflow={hasOverflow} gridLayout={gridLayout}>
                  {article.title}
                </Title>
                <Excerpt
                  narrow={narrow}
                  hasOverflow={hasOverflow}
                  gridLayout={gridLayout}
                  hasheroimage={hasHeroImage}
                >
                  {article.excerpt}
                </Excerpt>
                {gridLayout === 'tiles' ? 
                  <div></div>: 
                  <MetaData gridlayout={gridLayout} isTop={false}>
                    <DateData gridlayout={gridLayout}>{article.date} · {article.timeToRead} min read</DateData>
                  </MetaData>
                }
              </TopContainer>

              {hasHeroImage ? 
                <ImageContainer narrow={narrow} gridlayout={gridLayout}>
                  <Image src={imageSource} />
                </ImageContainer> : 
              <div></div>
              }

              {gridLayout === 'tiles' ? 
                  <MetaData gridlayout={gridLayout} isTop={true}>
                      <TagData gridlayout={gridLayout}>{tagString}</TagData>
                      <DateData gridlayout={gridLayout}>{article.date} · {article.timeToRead} min read</DateData>
                  </MetaData> : <div></div>
              }
            </Item>
            )
            
            
        }
        
        

        {/* <TopContainer gridlayout={gridLayout}>
          {gridLayout === 'tiles' ? 
             <div></div>: 
            <MetaData gridlayout={gridLayout} isTop={true}>
             <TagData gridlayout={gridLayout}>{tagString}</TagData>
            </MetaData>
          }
          <Title dark hasOverflow={hasOverflow} gridLayout={gridLayout}>
            {article.title}
          </Title>
          <Excerpt
            narrow={narrow}
            hasOverflow={hasOverflow}
            gridLayout={gridLayout}
            hasheroimage={hasHeroImage}
          >
            {article.excerpt}
          </Excerpt>
          {gridLayout === 'tiles' ? 
             <div></div>: 
            <MetaData gridlayout={gridLayout} isTop={false}>
             <DateData gridlayout={gridLayout}>{article.date} · {article.timeToRead} min read</DateData>
            </MetaData>
          }
        </TopContainer>

        {hasHeroImage ? 
          <ImageContainer narrow={narrow} gridlayout={gridLayout}>
            <Image src={imageSource} />
          </ImageContainer> : 
        <div></div>}

        {gridLayout === 'tiles' ? 
            <MetaData gridlayout={gridLayout} isTop={true}>
                 <TagData gridlayout={gridLayout}>{tagString}</TagData>
                 <DateData gridlayout={gridLayout}>{article.date} · {article.timeToRead} min read</DateData>
            </MetaData> : 
        <div></div>} */}

 
    </ArticleLink>
  );
};

const wide = '1fr';
const narrow = '457px';

// ####### ArticlesListContainer #######

const ArticlesListContainer = styled.div<{ 
  alwaysShowAllDetails?: boolean;
  gridlayout: string;
}>`
  transition: opacity 0.3s cubic-bezier(.02, .01, .47, 1);
  ${p => p.alwaysShowAllDetails && showDetails}
  ${p => (p.gridlayout === 'simplest'? simplestContainerCSS : (p.gridlayout === 'tiles' ? tilesContainerCSS : null))}
  z-index: 1;
  position: relative;
`;

const simplestContainerCSS = p => css`
  background: linear-gradient(
    180deg,
    ${p.theme.colors.card} 0%,
    rgba(249, 250, 252, 0) 91.01%
  );
  border-radius: 8px;
  padding: 88px 98px;
  position: relative;
  z-index: 1;
  box-shadow:0px -20px 36px -28px rgb(0 0 0 / 0.12);

  ${mediaqueries.desktop_medium`
    padding: 80px;
  `}

  ${mediaqueries.phablet`
    padding: 30px;
    margin: 0 1.5rem;
  `}
`;


const showDetails = css`
  p {
    display: -webkit-box;
  }

  h2 {
    margin-bottom: 10px;
  }
`;



const tilesContainerCSS = css`
    display: flex;
    align-content: flex-start;
    align-items: flex-start;
    justify-content: flex-start;
    flex-wrap: wrap;

    ${mediaqueries.phablet`
      margin: 0 1em 0 1em;
    `}
`


// ####### list #######

const List = styled.div<{
  reverse: boolean;
  gridlayout: string;
  hasOnlyOneArticle: boolean;
  listIndex: number;
}>`
  // ${p => (p.gridlayout === 'tiles' ? listTile : listRow)}
  ${p => (p.gridlayout === 'simplest'? listSimplest: (p.gridlayout === 'tiles' ? listTiles : listRow))}
`;

const listSimplest = p => css`
  display: grid;
  // grid-template-rows: ${p.hasOnlyOneArticle ? '1fr' : '1fr 1fr'};
  grid-template-rows: 1fr;
  margin-bottom:40px;

  ${mediaqueries.phablet`
    margin: 1em;
    //margin-bottom: 40px;
    margin-top: 0px;
  `}

`;


const listTiles = p => css`
    display: inline-block;
    position: relative;
    background-color: ${p.theme.colors.card};;
    vertical-align: top;
    text-align: left;
    height: 490px;
    margin: 20px;
    box-shadow: 0 20px 20px rgba(0,0,0,.08);
    border-radius:12px;
    overflow: hidden;
    white-space: normal;
    -webkit-transition: box-shadow 300ms cubic-bezier(.02, .01, .47, 1), transform 300ms cubic-bezier(.02, .01, .47, 1);
    -moz-transition: box-shadow 300ms cubic-bezier(.02, .01, .47, 1), transform 300ms cubic-bezier(.02, .01, .47, 1);
    transition: box-shadow 300ms cubic-bezier(.02, .01, .47, 1), transform 300ms cubic-bezier(.02, .01, .47, 1);
    color: #4B4F56;
    width:353px;
    margin-left:${p.listIndex%3 === 0 ? '0px' : (p.listIndex%3 === 1 ? '20px':'20px' )};
    margin-right:${p.listIndex%3 === 0 ? '20px' : (p.listIndex%3 === 1 ? '20px':'0px' )};
    flex: 1 0 calc(33% - 27px);
    max-width: calc(33% - 27px);

    &:hover,&:focus{
      box-shadow: 0 40px 40px rgba(0,0,0,.16);
      transform: translate(0,-20px);
    }


    ${mediaqueries.desktop`
      width:308px;
      flex: 1 0 calc(50% - 20px);
      margin-left:${p.listIndex%2 === 0 ? '0px' : '20px'};
      margin-right:${p.listIndex%2 === 0 ? '20px' : '0px'};
      max-width: calc(50% - 20px);

      // &:hover,&:focus{
      //   box-shadow: none;
      //   transform: translate(0,-0px);
      // }
    `}
  
    ${mediaqueries.tablet`
      width:487px;
      flex: 1 0 100%;
      max-width: 100%;
      margin-left:0;
      margin-right:0;
      height:100%;
    `}
  
    ${mediaqueries.phablet`
      width:460px;
      margin-left:0;
      margin-right:0;
      background-color: transparent;
      box-shadow: none;
      overflow: visible;
      margin: 0px;
      &:hover,&:focus{
          box-shadow: none;
          transform: translate(0,-0px);
      }
    `}

`

const listTile = p => css`
  position: relative;
  display: flex;
  grid-template-columns: ${p.reverse
    ? `${narrow} ${wide}`
    : `${wide} ${narrow}`};
  grid-template-rows: 2;
  column-gap: 90px;

  &:not(:last-child) {
    margin-bottom: 75px;
  }

  ${mediaqueries.desktop_medium`
    column-gap: 60px;
    grid-template-columns: 1fr 1fr;
  `}

  ${mediaqueries.tablet`
    grid-template-columns: 1fr;
    column-gap: 60px;
    &:not(:last-child) {
      margin-bottom: 0;
    }
  `}

  ${mediaqueries.phablet`
    column-gap: 30px;
  `}
`;

// If only 1 article, dont create 2 rows.
const listRow = p => css`
  display: grid;
  // grid-template-rows: ${p.hasOnlyOneArticle ? '1fr' : '1fr 1fr'};
  grid-template-rows: 1fr;

  ${mediaqueries.phablet`
    margin: 1em;
    margin-bottom: 60px;
    margin-top: 0px;
  `}
`;

// ####### listItem #######

const Item = styled.div<{ gridlayout: string;hasheroimage:boolean; }>`
  ${p => (p.gridlayout ==='simplest'? listItemSimplest:(p.gridlayout === 'rows' ? listItemRow : listItemTile))}
  height: 100%;
  
  ${mediaqueries.tablet`
  
  `}

  ${mediaqueries.phablet`
    border-radius:12px;
    overflow:hidden;
    //background: white;
  `}
`;

const listItemSimplest = p => css`
    margin-bottom:20px;
`;

const listItemRow = p => css`
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: 1fr 488px;
  grid-column-gap: 96px;
  grid-template-rows: 1;
  align-items: center;
  position: relative;
  margin-bottom: 50px;

  ${mediaqueries.desktop`
    grid-column-gap: 24px;
    grid-template-columns: 1fr 380px;
  `}

  ${mediaqueries.tablet`
    grid-template-columns: 1fr;
  `}

  @media (max-width: 540px) {
    background: ${p.theme.colors.card};
  }

  ${mediaqueries.phablet`
    box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.2);
    // border-bottom-right-radius: 5px;
    // border-bottom-left-radius: 5px;
    border-radius:12px;
    padding: 20px;
    padding-top: 0px;
    padding-bottom: 0px;
  `}
`;

const listItemTile = p => css`
  position: relative;

  ${mediaqueries.tablet`
    margin-bottom: ${(p.gridlayout === 'tiles' ? '0px' : '60px')};
  `}

  @media (max-width: 540px) {
    background: ${p.theme.colors.card};
  }

  ${mediaqueries.phablet`
    margin-bottom: 50px;
    box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.2);
    // border-bottom-right-radius: 5px;
    // border-bottom-left-radius: 5px;
    // border-radius:25px;
  `}
`;

const TopContainer = styled.div<{
  gridlayout:string
}>`
  padding-left: ${p => (p.gridlayout === 'tiles' ? '20px' : '0px')};
  padding-right: ${p => (p.gridlayout === 'tiles' ? '20px' : '0px')};
  padding-top: ${p => (p.gridlayout === 'tiles' ? '24px' : '0px')};
  margin-bottom: ${p => (p.gridlayout === 'tiles' ? '16px' : '0px')};

`
// ####### ImageContainer #######

const ImageContainer = styled.div<{ narrow: boolean; gridlayout: string }>`
  position: relative;
  overflow:hidden;
  height: auto;
  transition: transform 0.3s cubic-bezier(.02, .01, .47, 1),
    box-shadow 0.3s cubic-bezier(.02, .01, .47, 1);

  & > div {
    height: 100%;
  }

  ${mediaqueries.tablet`
    // margin-bottom: 50px;
  `}

  ${p => (p.gridlayout === 'tiles' ? imageContainerTilesCSS : imageContainerRowsCSS)}

`;

const imageContainerTilesCSS = css`
  border-radius:0px;
  max-height:235px;
  box-shadow:0 30px 60px -10px rgba(0, 0, 0, 0),
  0 18px 36px -18px rgba(0, 0, 0, 0);
  padding-left:20px;
  padding-right:20px;

`;

const imageContainerRowsCSS = css`
  border-radius:12px;
  max-height:inherit;
  box-shadow:0 30px 60px -10px rgba(0, 0, 0, 0.12),0 18px 36px -18px rgba(0, 0, 0, 0.15);
  padding-left:0px;
  padding-right:0px;

  ${mediaqueries.phablet`
    border-radius: 0px;
    max-height: 235px;
    margin-bottom: 53px;
    margin-top: -17px;
    box-shadow:0 30px 60px -10px rgba(0, 0, 0, 0.0),0 18px 36px -18px rgba(0, 0, 0, 0.0);
  `}
}
`;


// ####### Title #######

const limitToTweleveLines = css`
  text-overflow: ellipsis;
  overflow-wrap: normal;
  -webkit-line-clamp: 18;
  -webkit-box-orient: vertical;
  display: -webkit-box;
  white-space: normal;
  overflow: hidden;

  ${mediaqueries.phablet`
    -webkit-line-clamp: 12;

    margin-bottom:33px;
  `}
`;

const limitToTwoLines = css`
  text-overflow: ellipsis;
  overflow-wrap: normal;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  display: -webkit-box;
  white-space: normal;
  overflow: hidden;

  ${mediaqueries.phablet`
    -webkit-line-clamp: 3;
  `}
`;

const limitToFourLines = css`
  text-overflow: ellipsis;
  overflow-wrap: normal;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  display: -webkit-box;
  white-space: normal;
  overflow: hidden;

  ${mediaqueries.phablet`
    -webkit-line-clamp: 3;
  `}
`;


const Title = styled(Headings.h2)`
  font-size: 21px;
  font-family: ${p => p.theme.fonts.serif};
  margin-bottom: ${p => p.hasOverflow && p.gridLayout === 'tiles' ? '35px' : '10px'};
  transition: color 0.3s cubic-bezier(.02, .01, .47, 1);
  padding-bottom:${p => (p.gridLayout === 'tiles'? '10px':'0px')};
  border-bottom: ${p => (p.gridLayout === 'tiles'? '1px solid':'')};
  border-color: ${p => p.theme.colors.light_grey};
  word-break: break-all;
  ${limitToTwoLines};

  ${mediaqueries.desktop`
    margin-bottom: 15px;
  `}

  ${mediaqueries.tablet`
    font-size: 24px;  
    border-bottom:none;
    padding-bottom:0px;
  `}

  ${mediaqueries.phablet`
    font-size: 22px;  
    // padding: 30px 20px 0;
    margin-bottom: 10px;
    -webkit-line-clamp: 3;
    border-bottom:none;
    padding-bottom:0px;
  `}
`;

// ####### Excerpt #######

const Excerpt = styled.p<{
  hasOverflow: boolean;
  narrow: boolean;
  gridLayout: string;
  hasheroimage: boolean;
}>`
  ${p => (p.hasheroimage? limitToFourLines : limitToTweleveLines)};
  font-size: 14px;
  text-align: justify;
  margin-bottom: 10px;
  color: ${p => p.theme.colors.grey};
  display: ${p => (p.hasOverflow && p.gridLayout === 'tiles' ? 'none' : 'box')};
  max-width: ${p => (p.narrow ? '415px' : '515px')};

`;


// ####### MetaData #######

const MetaData = styled.div<{
  gridlayout: string;
  isTop: boolean;
}>`
  ${p => (p.gridlayout === 'tiles' ? MetaTilesData : MetaRowsData)}
  ${p => (p.isTop? null : MetaRowsPhabletFix)}

`;

const MetaRowsPhabletFix = css`
  ${mediaqueries.phablet`
    position:absolute;
    bottom: 18px;
  `}
`;


const MetaRowsData = p => css`
  font-weight: 600;
  font-size: 14px;
  color: ${p.theme.colors.grey};

  margin-left: 0px;
  margin-right: 0px;
  margin-top: 0px;
  line-height: 24px;
  width: 100%;
  bottom: 0px;
  position: relative;
  border-top: none;
  overflow: hidden;


  ${mediaqueries.phablet`
    max-width: 100%;
    padding:  0px;
  `}
`;

const MetaTilesData = p => css`
  font-weight: 600;
  font-size: 12px;
  color: ${p.theme.colors.grey};

  margin-left: 20px;
  margin-right: 20px;
  margin-top: 0px;
  line-height: 40px;
  width: calc(100% - 40px);
  bottom: 0px;
  position: absolute;
  border-top: 1px solid ${p.theme.colors.light_grey};

  ${mediaqueries.tablet`
    position:relative;
    margin-top: 28px;
    line-height: 40px;
  `}

  ${mediaqueries.phablet`
    max-width: 100%;
    margin-top: 24px;
    line-height: 40px;
  `}
`;

const DateData = styled.div<{
  gridlayout: string;
}>`
  display:inline-block;
  float:${p => (p.gridlayout === 'tiles' ? 'right' : 'left')};
  opacity: 0.33;
  font-size:11px;
  transform:scale(0.9);
  transform-origin:${p => (p.gridlayout === 'tiles' ? 'center right' : 'center left')};
`;

const TagData = styled.div<{
  gridlayout: string;
}>`
  display:inline-block;
  float:left;
  opacity: 0.8;
  font-size:11px;
  margin-bottom:${p => (p.gridlayout === 'tiles' ? '0px' : '8px')};
  transform:scale(0.9);
  position:${p => (p.gridlayout === 'tiles' ? 'absolute' : '')};
`;

// ####### ArticleLink #######

const ArticleLink = styled(Link)<{
  gridlayout: string;
}>`
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  border-radius: 5px;
  z-index: 1;
  transition: transform 0.3s cubic-bezier(.02, .01, .47, 1);
  -webkit-tap-highlight-color: rgba(255, 255, 255, 0);

  &:hover ${ImageContainer}, &:focus ${ImageContainer} {
    transform: ${p => (p.gridlayout === 'tiles' ? 'translateY(0px)' : 'translateY(0px)')};
    box-shadow: ${p => (p.gridlayout === 'tiles' ? '0 50px 80px -20px rgba(0, 0, 0, 0),0 30px 50px -30px rgba(0, 0, 0, 0.)' : '0 50px 80px -20px rgba(0, 0, 0, 0.2),0 30px 50px -30px rgba(0, 0, 0, 0.25)')}
  }

  &:hover h2,
  &:focus h2 {
    color: ${p => p.theme.colors.accent};
  }

  &[data-a11y='true']:focus::after {
    content: '';
    position: absolute;
    left: -1.5%;
    top: -2%;
    width: 103%;
    height: 104%;
    border: 3px solid ${p => p.theme.colors.accent};
    background: rgba(255, 255, 255, 0.01);
    border-radius: 5px;
  }

  ${mediaqueries.phablet`
    &:hover ${ImageContainer} {
      transform: none;
      box-shadow: initial;
    }

    &:active {
      transform: scale(0.97) translateY(3px);
    }
  `}
`;
