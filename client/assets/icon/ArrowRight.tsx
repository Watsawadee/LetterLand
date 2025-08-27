import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

const ArrowRight = (props: SvgProps) => (
  <Svg
    width={35}
    height={35}
    viewBox="0 0 12 12"
    {...props}
  >
    <Path
      fill="#fff"
      d="M1.5 6a.75.75 0 0 1 .75-.75h5.94L6.22 3.28a.75.75 0 0 1 1.06-1.06l3.25 3.25a.75.75 0 0 1 0 1.06L7.28 9.78a.75.75 0 0 1-1.06-1.06l1.97-1.97H2.25A.75.75 0 0 1 1.5 6"
    />
  </Svg>
);

export default ArrowRight;
