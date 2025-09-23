import * as React from "react";
import Svg, { Rect, SvgProps } from "react-native-svg";

const Stop = (props: SvgProps) => (
  <Svg width={35} height={35} viewBox="0 0 22 22" fill="none" {...props}>
    <Rect width="4" height="14" x="6" y="5" fill="#5B6073" rx="1" />
    <Rect width="4" height="14" x="14" y="5" fill="#5B6073" rx="1" />
  </Svg>
);

export default Stop;
