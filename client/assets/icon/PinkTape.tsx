import * as React from "react";
import Svg, {
  Path,
  SvgProps,
  Defs,
  FeFlood,
  G,
  Filter,
  FeColorMatrix,
  FeBlend,
  FeOffset,
  FeGaussianBlur,
  FeComposite,
} from "react-native-svg";

const PinkTape = (props: SvgProps) => (
  <Svg width={103} height={67} viewBox="0 0 103 67" fill="none" {...props}>
    <G filter="url(#filter0_d_1762_217)">
      <Path
        fill="#EF89C4"
        fillOpacity="0.7"
        d="m12.85 0 87.579 36.809L85 45.5l4.58 17.122L2 25.812 17 17.5z"
      ></Path>
    </G>
    <Defs>
      <Filter
        id="filter0_d_1762_217"
        width="102.428"
        height="66.622"
        x="0"
        y="0"
        filterUnits="userSpaceOnUse"
      >
        <FeFlood floodOpacity="0" result="BackgroundImageFix"></FeFlood>
        <FeColorMatrix
          in="SourceAlpha"
          result="hardAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        ></FeColorMatrix>
        <FeOffset dy="2"></FeOffset>
        <FeGaussianBlur stdDeviation="1"></FeGaussianBlur>
        <FeComposite in2="hardAlpha" operator="out"></FeComposite>
        <FeColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"></FeColorMatrix>
        <FeBlend
          in2="BackgroundImageFix"
          result="effect1_dropShadow_1762_217"
        ></FeBlend>
        <FeBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_1762_217"
          result="shape"
        ></FeBlend>
      </Filter>
    </Defs>
  </Svg>
);

export default PinkTape;
