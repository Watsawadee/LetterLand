import * as React from "react";
import Svg, { Rect, SvgProps } from "react-native-svg";

const Grid = (props: SvgProps) => (
  <Svg width={60} height={60} viewBox="0 0 120 120" fill="none" {...props}>
    <Rect width="27" height="27" fill="#FAE269" rx="3"></Rect>
    <Rect width="27" height="27" x="31" fill="#FFFCF6" rx="3"></Rect>
    <Rect width="27" height="27" x="62" fill="#FFFCF6" rx="3"></Rect>
    <Rect width="27" height="27" x="93" fill="#FFFCF6" rx="3"></Rect>
    <Rect width="27" height="27" y="31" fill="#FFFCF6" rx="3"></Rect>
    <Rect width="27" height="27" x="31" y="31" fill="#FAE269" rx="3"></Rect>
    <Rect width="27" height="27" x="62" y="31" fill="#FFFCF6" rx="3"></Rect>
    <Rect width="27" height="27" x="93" y="31" fill="#FFFCF6" rx="3"></Rect>
    <Rect width="27" height="27" y="62" fill="#FFFCF6" rx="3"></Rect>
    <Rect width="27" height="27" x="31" y="62" fill="#FFFCF6" rx="3"></Rect>
    <Rect width="27" height="27" x="62" y="62" fill="#FAE269" rx="3"></Rect>
    <Rect width="27" height="27" x="93" y="62" fill="#FFFCF6" rx="3"></Rect>
    <Rect width="27" height="27" y="93" fill="#FFFCF6" rx="3"></Rect>
    <Rect width="27" height="27" x="31" y="93" fill="#FFFCF6" rx="3"></Rect>
    <Rect width="27" height="27" x="62" y="93" fill="#FFFCF6" rx="3"></Rect>
    <Rect width="27" height="27" x="93" y="93" fill="#FAE269" rx="3"></Rect>
  </Svg>
);

export default Grid;
