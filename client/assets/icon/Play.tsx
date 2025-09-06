import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

const Play = (props: SvgProps) => (
  <Svg width={32} height={32} viewBox="0 0 24 24" {...props}>
	<Path fill="none" stroke="#5B6073" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.20} d="M2 14.959V9.04C2 8.466 2.448 8 3 8h3.586a.98.98 0 0 0 .707-.305l3-3.388c.63-.656 1.707-.191 1.707.736v13.914c0 .934-1.09 1.395-1.716.726l-2.99-3.369A.98.98 0 0 0 6.578 16H3c-.552 0-1-.466-1-1.041M16 8.5c1.333 1.778 1.333 5.222 0 7M19 5c3.988 3.808 4.012 10.217 0 14"/>
  </Svg>
);

export default Play;
