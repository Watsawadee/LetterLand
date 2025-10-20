import * as React from "react";
import Svg, { Path, Rect, SvgProps} from "react-native-svg";

const SvgIcon = (props: SvgProps) => (
  <Svg
    width="40"
    height="40"
    fill="none"
    viewBox="0 0 159 133"
  >
    <Path
      fill="#E6F0FB"
      d="M0 18h159v105c0 5.523-4.477 10-10 10H10c-5.523 0-10-4.477-10-10z"
    ></Path>
    <Path fill="#6AB0FF" d="M0 9a9 9 0 0 1 9-9h141a9 9 0 0 1 9 9v9H0z"></Path>
    <Rect
      width="18.881"
      height="35"
      x="25.838"
      y="81"
      fill="#6085A4"
      rx="2"
    ></Rect>
    <Rect
      width="18.881"
      height="51"
      x="52.668"
      y="65"
      fill="#6085A4"
      rx="2"
    ></Rect>
    <Rect
      width="18.881"
      height="67"
      x="79.5"
      y="49"
      fill="#6085A4"
      rx="2"
    ></Rect>
    <Rect
      width="19.875"
      height="83"
      x="106.332"
      y="33"
      fill="#6085A4"
      rx="2"
    ></Rect>
    <Rect
      width="14.906"
      height="5"
      x="8.943"
      y="64"
      fill="#BDD6F0"
      rx="2.5"
    ></Rect>
    <Rect
      width="26.831"
      height="5"
      x="8.943"
      y="49"
      fill="#BDD6F0"
      rx="2.5"
    ></Rect>
    <Rect
      width="35.775"
      height="5"
      x="8.943"
      y="34"
      fill="#BDD6F0"
      rx="2.5"
    ></Rect>
  </Svg>
);

export default SvgIcon;
