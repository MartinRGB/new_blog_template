import React, { useContext, useEffect,useState} from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/core';
import mediaqueries from "@styles/media";
import { ITagInfo } from '@types';

interface ArticlesTagFilterProps {
  tagInfo: ITagInfo;
}

const ArticlesTagFilter: React.FC<ArticlesTagFilterProps> = ({
    tagInfo,
  }) => {
  
    if (!tagInfo) return null;
    // console.log(tagInfo)

  
    useEffect(() => {
  
    }, []);

    const tagPairs = tagInfo.resultArray.reduce((result, value, index, array) => {
      // if (index % 2 === 0) {
      //   result.push(array.slice(index, index + 2));
      // }
      result.push(array[index])
      return result;
    }, []);

    // console.log(tagPairs)
  
  
    return (
        <TagFilterContainer>
          {tagPairs.map((el,index) =>{
            // console.log('233')
            // console.log(el.tag)
            return (
              <TagContainer key={index}>
                <NameData>{el.name}</NameData><NumData>{el.times}</NumData>
              </TagContainer>
            );
          })}
        </TagFilterContainer>
    );
  };

const TagFilterContainer = styled.div`
    display: flex;
    align-items: flex-start;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    padding: 0px 32px 18px;
    position: relative;

    ${mediaqueries.desktop`
    `};

    ${mediaqueries.tablet`
    `};

    ${mediaqueries.phablet`
      margin: 0 1em 0 1em;
      margin-bottom: 18px;
    `};
`;

const TagContainer = styled.a`
    display: inline-block;
    padding-left: 12px;
    padding-right: 12px;
    margin-bottom: 12px;
    border-radius: 4px;
    height: 25px;
    // background: ${p => p.theme.colors.light_grey};
    ${mediaqueries.desktop`
    `};

    ${mediaqueries.tablet`
    `};

    ${mediaqueries.phablet`
    `};
`;
const NameData = styled.div`
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    transform: scale(0.9);
    transform-origin: left center;
    color:${p => p.theme.colors.grey};
    ${mediaqueries.desktop`
    `};

    ${mediaqueries.tablet`
    `};

    ${mediaqueries.phablet`
    `};
`;

const NumData = styled.div`
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    transform: scale(0.9);
    transform-origin: right center;
    color:${p => p.theme.colors.grey};
    opacity:0.33;
    margin-left: 2px;
    ${mediaqueries.desktop`
    `};

    ${mediaqueries.tablet`
    `};

    ${mediaqueries.phablet`
    `};
`;
  
  export default ArticlesTagFilter;