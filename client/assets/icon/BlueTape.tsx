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

const BlueTape = (props: SvgProps) => (
  <Svg width={100} height={77} viewBox="0 0 100 77" fill="none" {...props}>
    <G filter="url(#filter0_d_1782_27)">
      <Path
        fill="#58A7F8"
        fillOpacity="0.7"
        d="m16.43 0 81.414 48.957-16.513 6.395 2.083 17.6L2 23.997l16.034-6.082z"
      ></Path>
    </G>
    <Defs>
      <Filter
        id="filter0_d_1782_27"
        width="99.844"
        height="76.953"
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
          result="effect1_dropShadow_1782_27"
        ></FeBlend>
        <FeBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_1782_27"
          result="shape"
        ></FeBlend>
      </Filter>
    </Defs>
  </Svg>
);

export default BlueTape;
