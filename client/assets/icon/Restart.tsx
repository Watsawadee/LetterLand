import * as React from "react";
import Svg, { G, Path, SvgProps } from "react-native-svg";

const Restart = (props: SvgProps) => (
  <Svg
    width={35}
    height={35}
    viewBox="0 0 24 24"
    {...props}
  >
    <G
      fill="none"
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
    >
      <Path d="M12 3a9 9 0 1 1-5.657 2" />
      <Path d="M3 4.5h4v4" />
    </G>
  </Svg>
);

export default Restart;
