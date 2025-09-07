import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

const ArrowLeft = (props: SvgProps) => (
  <Svg
    width={48}
    height={48}
    viewBox="0 0 24 24"
    {...props}
  >
    <Path
      fill="none"
      stroke={props.color ?? "#000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M14 7l-5 5l5 5"
    />
  </Svg>
);

export default ArrowLeft;
