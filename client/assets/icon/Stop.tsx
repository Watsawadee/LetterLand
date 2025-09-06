import * as React from "react";
import Svg, { Rect, SvgProps } from "react-native-svg";

const Stop = (props: SvgProps) => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none" {...props}>
    <Rect width="4" height="14" x="6" y="5" fill="#5B6073" rx="1" />
    <Rect width="4" height="14" x="14" y="5" fill="#5B6073" rx="1" />
  </Svg>
);

export default Stop;
