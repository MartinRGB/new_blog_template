import styled from "@emotion/styled";
import mediaqueries from "@styles/media";

const Blockquote = styled.blockquote`
  transition: ${p => p.theme.colorModeTransition};
  margin: 15px auto 50px;
  color: ${p => p.theme.colors.articleText};
  font-family: ${p => p.theme.fonts.serif};
  font-style: italic;
  width: 744px;

  ${mediaqueries.desktop`
    width: 507px;
  `};

  ${mediaqueries.tablet`
    margin: 10px auto 35px;
    width: 486px;
  `};

  & > p {
    font-family: ${p => p.theme.fonts.serif};
    max-width: 880px !important;
    // padding-right: 100px;
    padding-bottom: 0;
    width: 100%;
    margin: 0 auto;
    font-size: 36px;
    line-height: 1.32;
    font-weight: bold;



    ${mediaqueries.tablet`
      font-size: 26px;
    `};

    ${mediaqueries.phablet`
      font-size: 26px;
      //padding: 0 20px 0 20px;
      padding: 0 28px 0 28px;
      margin-left: -7px;
    `};
  }
`;

export default Blockquote;
