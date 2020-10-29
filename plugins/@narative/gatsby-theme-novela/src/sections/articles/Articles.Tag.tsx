import React, { useContext, useEffect,useState,createContext} from 'react';
import styled from '@emotion/styled';
import throttle from "lodash/throttle";
import { css } from '@emotion/core';
import mediaqueries from "@styles/media";
import { ITag } from '@types';
import { Link } from 'gatsby';
import { SelectedTagContext } from './Articles.Tag.Context';

interface ArticlesTagFilterProps {
  tags: ITag[];
}

const ArticlesTag: React.FC<ArticlesTagFilterProps> = ({tags}) => {
    if (!tags) return null;

    const { selectedTag, hasSelectedTag, setSelectedTag,getSelectedTag } = useContext(
      SelectedTagContext,
    );

    useEffect(() => {
      setSelectedTag('all')
      getSelectedTag()
    }, []);

    const tagPairs = tags.reduce((result, value, index, array) => {
      // if (index % 2 === 0) {
      //   result.push(array.slice(index, index + 2));
      // }
      result.push(array[index]);
      return result;
    }, []);
  
    return (
        <TagFilterContainer>
          {tagPairs.map((el,index) =>{
            var isActive:boolean = (hasSelectedTag && selectedTag === el.name);
            return (
              <TagContainer 
                onClick={() => setSelectedTag(el.name)}
                active={isActive} 
                data-a11y="false" 
                key={index}>
                <NameData active={isActive}>{el.name}</NameData>
                <NumData active={isActive}>{el.times}</NumData>
              </TagContainer>
            );
          })}
        </TagFilterContainer>
    );
  };

const TagFilterContainer = styled.div<
  { 
  }
>`
    display: flex;
    align-items: flex-start;
    flex-direction: row;
    flex-wrap: wrap;
    backface-visibility: hidden;
    justify-content: center;
    padding: 18px 32px 18px;
    margin-bottom: 28px;
    position: relative;

    ${mediaqueries.desktop`
    `};

    ${mediaqueries.tablet`
    `};

    ${mediaqueries.phablet`
      margin: 0 1em 0 1em;
      margin-bottom: 28px;
    `};
`;

const TagContainer = styled.button<
  { 
    active:boolean;
  }
>`
    display: inline-block;
    padding-left: 12px;
    padding-right: 12px;
    backface-visibility: hidden;
    margin-left:5px;
    margin-right:5px;
    // margin-bottom: 12px;
    border-radius: 4px;
    height: 25px;
    //background: ${p => (p.active? p.theme.colors.light_grey:'none')};
    filter: ${p => (p.active? 'brightness(1.5)':'grayscale(1) brightness(1.5) blur(0.5px)')};
    //transform: ${p => (p.active? 'scale(1.1)':'none')};
    opacity: ${p => (p.active? '1':'0.66')};
    transition: all 0.3s cubic-bezier(.02,.01,.47,1);
    ${mediaqueries.desktop`
    `};

    ${mediaqueries.tablet`
    `};

    ${mediaqueries.phablet`
    `};

    &:hover{
      filter: ${p => (p.active? 'brightness(1.5)':'grayscale(1) brightness(1) blur(0px)')};
      //transform: scale(1.1);
      //opacity: ${p => (p.active? '1':'0.66')};
      //background: ${p => (p.theme.colors.light_grey)};
    }
`;
const NameData = styled.div<
{active:boolean}
>`
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    transform: scale(0.9);
    transform-origin: left center;
    color:${p => (p.active? p.theme.colors.primary:p.theme.colors.grey)};
    ${mediaqueries.desktop`
    `};

    ${mediaqueries.tablet`
    `};

    ${mediaqueries.phablet`
    `};
`;

const NumData = styled.div<
{active:boolean}
>`
    display: inline-block;
    font-size: 11px;
    font-weight: 500;
    transform: scale(0.9);
    transform-origin: right center;
    color:${p => (p.active? p.theme.colors.primary:p.theme.colors.grey)};
    opacity:${p => (p.active? '0.33':'0.53')};
    margin-left: 2px;
    ${mediaqueries.desktop`
    `};

    ${mediaqueries.tablet`
    `};

    ${mediaqueries.phablet`
    `};
`;
  
  export default ArticlesTag;