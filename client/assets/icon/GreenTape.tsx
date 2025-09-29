import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

const GreenTape = (props: SvgProps) => (
  <Svg width={215} height={69} viewBox="0 0 215 69" fill="none" {...props}>
    <Path
      fill="#71CB86"
      fillOpacity="0.5"
      d="M0 15.055 210.832 0l3.788 53.041L3.787 68.096z"
    ></Path>
  </Svg>
);

export default GreenTape;
