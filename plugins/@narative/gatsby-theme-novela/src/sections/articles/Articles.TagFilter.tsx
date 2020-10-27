import React, { useContext, useEffect,useState} from 'react';
import styled from '@emotion/styled';
import throttle from "lodash/throttle";
import { css } from '@emotion/core';
import mediaqueries from "@styles/media";
import { ITagInfo } from '@types';
import { Link } from 'gatsby';

interface ArticlesTagFilterProps {
  tagInfo: ITagInfo;
}

const ArticlesTagFilter: React.FC<ArticlesTagFilterProps> = ({tagInfo }) => {

    //const [states, setState] = useState<string>('init_State');
  

    if (!tagInfo) return null;
    // console.log(tagInfo)

    const [isHovered, setIsHovered] = useState<boolean>(false);
    const states = '全部';

  
    useEffect(() => {
      
    }, []);

    const tagPairs = tagInfo.resultArray.reduce((result, value, index, array) => {
      // if (index % 2 === 0) {
      //   result.push(array.slice(index, index + 2));
      // }
      result.push(array[index])
      return result;
    }, []);

    console.log(tagPairs)
  
  
    return (
        <TagFilterContainer onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}>
          {tagPairs.map((el,index) =>{
            return (
              <TagContainer 
                to={''} 
                isselected={(states === el.name)} 
                data-a11y="false" 
                key={index}>
                <NameData isselected={(states === el.name)}>{el.name}</NameData>
                <NumData isselected={(states === el.name)}>{el.times}</NumData>
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

const TagContainer = styled(Link)<
  {isselected:boolean}
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
    //background: ${p => (p.isselected? p.theme.colors.light_grey:'none')};
    filter: ${p => (p.isselected? 'brightness(1.5)':'grayscale(1) brightness(1.5) blur(0.5px)')};
    //transform: ${p => (p.isselected? 'scale(1.1)':'none')};
    opacity: ${p => (p.isselected? '1':'0.66')};
    transition: all 0.3s cubic-bezier(.02,.01,.47,1);
    ${mediaqueries.desktop`
    `};

    ${mediaqueries.tablet`
    `};

    ${mediaqueries.phablet`
    `};

    &:hover{
      filter: ${p => (p.isselected? 'brightness(1.5)':'grayscale(1) brightness(1) blur(0px)')};
      //transform: scale(1.1);
      //opacity: ${p => (p.isselected? '1':'0.66')};
      //background: ${p => (p.theme.colors.light_grey)};
    }
`;
const NameData = styled.div<
{isselected:boolean}
>`
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    transform: scale(0.9);
    transform-origin: left center;
    color:${p => (p.isselected? p.theme.colors.primary:p.theme.colors.grey)};
    ${mediaqueries.desktop`
    `};

    ${mediaqueries.tablet`
    `};

    ${mediaqueries.phablet`
    `};
`;

const NumData = styled.div<
{isselected:boolean}
>`
    display: inline-block;
    font-size: 11px;
    font-weight: 500;
    transform: scale(0.9);
    transform-origin: right center;
    color:${p => (p.isselected? p.theme.colors.primary:p.theme.colors.grey)};
    opacity:${p => (p.isselected? '0.33':'0.53')};
    margin-left: 2px;
    ${mediaqueries.desktop`
    `};

    ${mediaqueries.tablet`
    `};

    ${mediaqueries.phablet`
    `};
`;
  
  export default ArticlesTagFilter;