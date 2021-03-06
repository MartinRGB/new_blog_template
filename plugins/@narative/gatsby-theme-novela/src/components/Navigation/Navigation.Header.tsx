import React, { useState, useEffect, useRef} from "react";
import styled from "@emotion/styled";
import { Link, navigate, graphql, useStaticQuery } from "gatsby";
import { useColorMode } from "theme-ui";

import Section from "@components/Section";
import Logo from "@components/Logo";
import throttle from "lodash/throttle";
import Icons from "@nativeIcons";
import mediaqueries from "@styles/media";
import {
  copyToClipboard,
  getWindowDimensions,
  getBreakpointFromTheme,
} from "@utils";

const siteQuery = graphql`
  {
    sitePlugin(name: { eq: "@narative/gatsby-theme-novela" }) {
      pluginOptions {
        rootPath
        basePath
      }
    }
  }
`;

const DarkModeToggle: React.FC<{}> = () => {
  const [colorMode, setColorMode] = useColorMode();
  const isDark = colorMode === `dark`;

  function toggleColorMode(event) {
    event.preventDefault();
    setColorMode(isDark ? `light` : `dark`);
  }

  return (
    <IconWrapper
      isDark={isDark}
      onClick={toggleColorMode}
      data-a11y="false"
      aria-label={isDark ? "Activate light mode" : "Activate dark mode"}
      title={isDark ? "Activate light mode" : "Activate dark mode"}
    >
      <MoonOrSun isDark={isDark} />
      {/* <MoonMask isDark={isDark} /> */}
    </IconWrapper>
  );
};

const SharePageButton: React.FC<{}> = () => {
  const [hasCopied, setHasCopied] = useState<boolean>(false);
  const [colorMode] = useColorMode();
  const isDark = colorMode === `dark`;
  const fill = isDark ? "#fff" : "#000";

  function copyToClipboardOnClick() {
    if (hasCopied) return;

    copyToClipboard(window.location.href);
    setHasCopied(true);

    setTimeout(() => {
      setHasCopied(false);
    }, 1000);
  }

  return (
    <IconWrapper
      isDark={isDark}
      onClick={copyToClipboardOnClick}
      data-a11y="false"
      aria-label="Copy URL to clipboard"
      title="Copy URL to clipboard"
    >
      <Icons.Link fill={fill} />
      <ToolTip isDark={isDark} hasCopied={hasCopied}>
        Copied
      </ToolTip>
    </IconWrapper>
  );
};

const NavigationHeader: React.FC<{}> = () => {
  const [showBackArrow, setShowBackArrow] = useState<boolean>(false);
  const [previousPath, setPreviousPath] = useState<string>("/");
  const { sitePlugin } = useStaticQuery(siteQuery);
  const [shouldFixHeader, setShouldFixHeader] = useState<boolean>(false);
  const [headerOffset, setHeaderOffset] = useState<number>(0);
  const blurContainerRef = useRef<HTMLDivElement>(null);
  const logoGraphicRef = useRef<HTMLDivElement>(null);

  const [colorMode] = useColorMode();
  const fill = colorMode === "dark" ? "#fff" : "#000";
  const { rootPath, basePath } = sitePlugin.pluginOptions;

  useEffect(() => {
    const { width } = getWindowDimensions();
    const phablet = getBreakpointFromTheme("phablet");

    const containerEl = blurContainerRef.current;
    const logoEl = logoGraphicRef.current;

    const handleScroll = throttle(() => {
      const scrollY = window.scrollY;
      const containerH = containerEl.getBoundingClientRect().height;
      const logoH = logoEl.getBoundingClientRect().height;

      if(scrollY > containerH - logoH - 16 - 16){
        setShouldFixHeader(true)
        setHeaderOffset(containerH - logoH - 16 - 16)
        // TODO SetClamp
        console.log('TODO SetClamp')
      }else{
        setShouldFixHeader(false)
        setHeaderOffset(0)
      }
    }, 20);

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    const prev = localStorage.getItem("previousPath");
    const previousPathWasHomepage =
      prev === (rootPath || basePath) || (prev && prev.includes("/page/"));
    const currentPathIsHomepage =
      location.pathname === (rootPath || basePath) || location.pathname.includes("/page/");

    setShowBackArrow(
      previousPathWasHomepage && !currentPathIsHomepage && width <= phablet,
    );
    setPreviousPath(prev);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <BlurContainer ref={blurContainerRef} shouldFixHeader={shouldFixHeader} headerOffset={headerOffset}>
      <Section>
        <NavContainer id="Nav__Container">
          <LogoLink ref={logoGraphicRef}
            to={rootPath || basePath}
            data-a11y="false"
            title="Navigate back to the homepage"
            aria-label="Navigate back to the homepage"
            back={showBackArrow ? "true" : "false"}
          >
            {showBackArrow && (
              <BackArrowIconContainer>
                <Icons.ChevronLeft fill={fill} />
              </BackArrowIconContainer>
            )}
            <Logo fill={fill} />
            <Hidden>Navigate back to the homepage</Hidden>
          </LogoLink>
          <NavControls>
            {showBackArrow ? (
              <button
                onClick={() => navigate(previousPath)}
                title="Navigate back to the homepage"
                aria-label="Navigate back to the homepage"
              >
                <Icons.Ex fill={fill} />
              </button>
            ) : (
              <>
                <SharePageButton />
                <DarkModeToggle />
              </>
            )}
          </NavControls>
        </NavContainer>
      </Section>
    </BlurContainer>
  );
};

export default NavigationHeader;

const BackArrowIconContainer = styled.div`
  transition: 0.2s transform var(--ease-out-quad);
  opacity: 0;
  padding-right: 30px;
  animation: fadein 0.3s linear forwards;

  @keyframes fadein {
    to {
      opacity: 1;
    }
  }

  ${mediaqueries.desktop_medium`
    display: none;
  `}
`;

const NavContainer = styled.div`
  position: relative;
  z-index: 100;
  padding-top: 100px;
  display: flex;
  justify-content: space-between;

  ${mediaqueries.desktop_medium`
    padding-top: 50px;
  `};

  @media screen and (max-height: 800px) {
    padding-top: 50px;
  }
`;

const BlurContainer = styled.div<{
  headerOffset:number;
  shouldFixHeader: boolean;
}>`
  width:100%;
  padding-bottom:16px;
  z-index: 11;
  border-bottom: ${p => (p.shouldFixHeader ? "0.5px solid " : "")};
  border-color:${p => p.theme.colors.light_grey};
  top:${p => (p.shouldFixHeader ? -p.headerOffset +"px" : "0px")};
  position: ${p => (p.shouldFixHeader ? "sticky" : "relative")};



  &::before{
    content: '';
    height: 100%;
    width: 100%;
    position: absolute;
    overflow: hidden;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    -webkit-backdrop-filter: saturate(180%) blur(1em);
    backdrop-filter: ${p => (p.shouldFixHeader ? "saturate(180%) blur(1em)" : "")};
    //-webkit-mask: -webkit-gradient(linear, right top, left top, color-stop(70%, black), to(transparent));
    -webkit-mask: linear-gradient(to bottom,#000000 80%,#00000080 100%);
    //mask: -webkit-gradient(linear, right top, left top, color-stop(70%, black), to(transparent));
    mask: linear-gradient(to bottom,#000000 80%,#00000080 100%);
  }

  &::after{
    content: '';
    height: 100%;
    width: 100%;
    position: absolute;
    overflow: hidden;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    background: ${p => (p.shouldFixHeader ? p.theme.colors.nav_gradient:"none")};
    //background: ;
  }

  ${mediaqueries.desktop_medium`
    
  `};

  ${mediaqueries.phablet`
    padding-bottom:16px;

    & > section{
      padding: 0 4rem;
    }
  `}


  @media screen and (max-height: 800px) {
    
  }
`;

const LogoLink = styled(Link)<{ back: string }>`
  position: relative;
  display: flex;
  align-items: center;
  left: ${p => (p.back === "true" ? "-54px" : 0)};

  ${mediaqueries.desktop_medium`
    left: 0
  `}

  &[data-a11y="true"]:focus::after {
    content: "";
    position: absolute;
    left: -10%;
    top: -30%;
    width: 120%;
    height: 160%;
    border: 2px solid ${p => p.theme.colors.accent};
    background: rgba(255, 255, 255, 0.01);
    border-radius: 5px;
  }

  &:hover {
    ${BackArrowIconContainer} {
      transform: translateX(-3px);
    }
  }
`;

const NavControls = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  ${mediaqueries.phablet`
    right: -5px;
  `}
`;

const ToolTip = styled.div<{ isDark: boolean; hasCopied: boolean }>`
  position: absolute;
  padding: 4px 13px;
  background: ${p => (p.isDark ? "#000" : "rgba(0,0,0,0.1)")};
  color: ${p => (p.isDark ? "#fff" : "#000")};
  border-radius: 5px;
  font-size: 14px;
  top: -35px;
  opacity: ${p => (p.hasCopied ? 1 : 0)};
  transform: ${p => (p.hasCopied ? "translateY(-3px)" : "none")};
  transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;

  &::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: -6px;
    margin: 0 auto;
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid ${p => (p.isDark ? "#000" : "rgba(0,0,0,0.1)")};
  }
`;

const IconWrapper = styled.button<{ isDark: boolean }>`
  opacity: 0.5;
  position: relative;
  border-radius: 5px;
  width: 40px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s ease;
  margin-left: 30px;

  &:hover {
    opacity: 1;
  }

  &[data-a11y="true"]:focus::after {
    content: "";
    position: absolute;
    left: 0;
    top: -30%;
    width: 100%;
    height: 160%;
    border: 2px solid ${p => p.theme.colors.accent};
    background: rgba(255, 255, 255, 0.01);
    border-radius: 5px;
  }

  ${mediaqueries.tablet`
    display: inline-flex;
    transform: scale(0.708);
    margin-left: 10px;


    &:hover {
      opacity: 0.5;
    }
  `}
`;

// This is based off a codepen! Much appreciated to: https://codepen.io/aaroniker/pen/KGpXZo
const MoonOrSun = styled.div<{ isDark: boolean }>`
  position: relative;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: ${p => (p.isDark ? "4px" : "2px")} solid
    ${p => (p.isDark ? p.theme.colors.white : p.theme.colors.primary)};
  background: ${p => p.theme.colors.white};
  transform: scale(${p => (p.isDark ? 0.55 : 1)});
  transition: all 0.45s ease;
  overflow: ${p => (p.isDark ? "visible" : "hidden")};

  &::before {
    content: "";
    position: absolute;
    right: -9px;
    top: -9px;
    height: 24px;
    width: 24px;
    border: 2px solid ${p => p.theme.colors.primary};
    background:${p => p.theme.colors.primary};
    border-radius: 50%;
    transform: translate(${p => (p.isDark ? "14px, -14px" : "0, 0")});
    opacity: ${p => (p.isDark ? 0 : 1)};
    transition: ${p => (p.isDark ? 'all 0.0s ease 0.0s' : 'all 0.45s ease 0.2s')};;
  }

  &::after {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin: -4px 0 0 -4px;
    position: absolute;
    top: 50%;
    left: 50%;
    box-shadow: 0 -23px 0 ${p => p.theme.colors.primary},
      0 23px 0 ${p => p.theme.colors.primary},
      23px 0 0 ${p => p.theme.colors.primary},
      -23px 0 0 ${p => p.theme.colors.primary},
      15px 15px 0 ${p => p.theme.colors.primary},
      -15px 15px 0 ${p => p.theme.colors.primary},
      15px -15px 0 ${p => p.theme.colors.primary},
      -15px -15px 0 ${p => p.theme.colors.primary};
    transform: scale(${p => (p.isDark ? 1 : 0)});
    opacity:${p => (p.isDark ? 1 : 0)};
    transition: ${p => (p.isDark ? 'all 0.35s ease 0.0s': 'all 0.05s ease 0.0s')};

    ${p => mediaqueries.tablet`
      transform: scale(${p.isDark ? 0.92 : 0});
    `}
  }
`;

const MoonMask = styled.div<{ isDark: boolean }>`
  position: absolute;
  right: -1px;
  top: -8px;
  height: 24px;
  width: 24px;
  border-radius: 50%;
  border: 0;
  background: ${p => p.theme.colors.background};
  transform: translate(${p => (p.isDark ? "14px, -14px" : "0, 0")});
  opacity: ${p => (p.isDark ? 0 : 1)};
  transition: ${p => p.theme.colorModeTransition}, transform 0.45s ease;
`;

const Hidden = styled.span`
  position: absolute;
  display: inline-block;
  opacity: 0;
  width: 0px;
  height: 0px;
  visibility: hidden;
  overflow: hidden;
`;
