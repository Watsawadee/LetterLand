import * as React from "react";
import Svg, {
  Path,
  SvgProps,
  Defs,
  FeFlood,
  G,
  Rect,
  Filter,
  FeColorMatrix,
  FeBlend,
  FeOffset,
  FeGaussianBlur,
  FeComposite,
} from "react-native-svg";

const ShopIcon = (props: SvgProps) => (
  <Svg width={61} height={67} fill="none" viewBox="0 0 61 67" {...props}>
    <G filter="url(#filter0_d_1732_168)">
      <Rect
        width="49.077"
        height="52.193"
        fill="#C8A8E0"
        rx="5"
        transform="translate(5.7 8.507)skewX(-.011)"
      ></Rect>
    </G>
    <G filter="url(#filter1_d_1732_168)">
      <Rect
        width="49.073"
        height="14.786"
        fill="#C8A8E0"
        rx="5"
        transform="matrix(1 .0011 .00376 1 5.63 2.022)"
      ></Rect>
    </G>
    <G filter="url(#filter2_d_1732_168)">
      <Rect
        width="14.411"
        height="16.719"
        fill="#AE7EDF"
        rx="2"
        transform="translate(23.318 43.963)skewX(-.026)"
      ></Rect>
    </G>
    <Path
      fill="#F2AFD3"
      d="M0 8.426h6.677V25.17a3.339 3.339 0 0 1-6.677 0zM13.356 8.426h6.677V25.17a3.339 3.339 0 0 1-6.677 0zM26.709 8.426h6.782v16.691a3.39 3.39 0 0 1-6.782 0zM40.168 8.426h6.782v16.691a3.39 3.39 0 1 1-6.782 0z"
    ></Path>
    <Path
      fill="#EF89C4"
      d="M6.574 8.426h6.782v16.691a3.39 3.39 0 0 1-6.782 0zM20.033 8.426h6.678V25.17a3.339 3.339 0 0 1-6.677 0zM33.492 8.426h6.678V25.17a3.339 3.339 0 0 1-6.677 0zM46.951 8.426h6.678V25.17a3.339 3.339 0 0 1-6.677 0z"
    ></Path>
    <Path
      fill="#F2AFD3"
      d="M53.611 8.426h6.782v16.691a3.39 3.39 0 0 1-6.782 0z"
    ></Path>
    <Path
      fill="#F2F8F9"
      d="M18.108 40.091q-1 0-1.794-.325a2.97 2.97 0 0 1-1.274-.962q-.468-.637-.494-1.534h2.366q.053.507.351.78.3.26.78.26.495 0 .78-.221a.78.78 0 0 0 .286-.637.74.74 0 0 0-.234-.559 1.7 1.7 0 0 0-.559-.364 9 9 0 0 0-.936-.325q-.884-.273-1.443-.546a2.7 2.7 0 0 1-.962-.806q-.403-.533-.403-1.391 0-1.274.923-1.989.923-.728 2.405-.728 1.508 0 2.431.728.923.715.988 2.002h-2.405q-.026-.442-.325-.689-.3-.26-.767-.26-.403 0-.65.221-.247.208-.247.611 0 .442.416.689.415.247 1.3.533.885.3 1.43.572.559.273.962.793t.403 1.339q0 .78-.403 1.417-.39.638-1.144 1.014-.754.377-1.781.377m9.155-7.423q1.249 0 2.002.832.754.819.754 2.262V40h-2.21v-3.939q0-.727-.377-1.131-.377-.403-1.014-.403-.638 0-1.014.403-.377.404-.377 1.131V40h-2.223v-9.62h2.223v3.341q.338-.48.923-.767a2.95 2.95 0 0 1 1.313-.286m7.603 7.436q-1.065 0-1.924-.455a3.4 3.4 0 0 1-1.34-1.3q-.48-.845-.48-1.976 0-1.118.494-1.963a3.34 3.34 0 0 1 1.352-1.313q.858-.455 1.924-.455t1.924.455a3.34 3.34 0 0 1 1.352 1.313q.495.845.494 1.963 0 1.118-.507 1.976-.495.845-1.365 1.3-.858.455-1.924.455m0-1.924q.637 0 1.079-.468.455-.468.455-1.339 0-.87-.442-1.339a1.39 1.39 0 0 0-1.066-.468q-.65 0-1.08.468-.428.455-.428 1.339 0 .87.416 1.339.429.468 1.066.468m7.198-4.407q.326-.507.897-.819.573-.312 1.34-.312.896 0 1.624.455t1.144 1.3q.43.845.43 1.963t-.43 1.976a3.2 3.2 0 0 1-1.144 1.313 3 3 0 0 1-1.625.455q-.754 0-1.339-.312a2.46 2.46 0 0 1-.897-.806v4.472h-2.223V32.746h2.223zm3.172 2.587q0-.832-.468-1.3a1.5 1.5 0 0 0-1.13-.481q-.664 0-1.132.481-.455.48-.455 1.313 0 .832.455 1.313.469.48 1.131.481.664 0 1.131-.481.468-.494.468-1.326"
    ></Path>
    <Defs>
      <Filter
        id="filter0_d_1732_168"
        width="57.08"
        height="60.197"
        x="1.695"
        y="6.502"
        filterUnits="userSpaceOnUse"
      >
        <FeFlood floodOpacity="0" result="BackgroundImageFix"></FeFlood>
        <FeColorMatrix
          in="SourceAlpha"
          result="hardAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        ></FeColorMatrix>
        <FeOffset dy="2"></FeOffset>
        <FeGaussianBlur stdDeviation="2"></FeGaussianBlur>
        <FeComposite in2="hardAlpha" operator="out"></FeComposite>
        <FeColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"></FeColorMatrix>
        <FeBlend
          in2="BackgroundImageFix"
          result="effect1_dropShadow_1732_168"
        ></FeBlend>
        <FeBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_1732_168"
          result="shape"
        ></FeBlend>
      </Filter>
      <Filter
        id="filter1_d_1732_168"
        width="57.09"
        height="22.828"
        x="1.65"
        y="0.028"
        filterUnits="userSpaceOnUse"
      >
        <FeFlood floodOpacity="0" result="BackgroundImageFix"></FeFlood>
        <FeColorMatrix
          in="SourceAlpha"
          result="hardAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        ></FeColorMatrix>
        <FeOffset dy="2"></FeOffset>
        <FeGaussianBlur stdDeviation="2"></FeGaussianBlur>
        <FeComposite in2="hardAlpha" operator="out"></FeComposite>
        <FeColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"></FeColorMatrix>
        <FeBlend
          in2="BackgroundImageFix"
          result="effect1_dropShadow_1732_168"
        ></FeBlend>
        <FeBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_1732_168"
          result="shape"
        ></FeBlend>
      </Filter>
      <Filter
        id="filter2_d_1732_168"
        width="22.414"
        height="24.721"
        x="19.314"
        y="41.96"
        filterUnits="userSpaceOnUse"
      >
        <FeFlood floodOpacity="0" result="BackgroundImageFix"></FeFlood>
        <FeColorMatrix
          in="SourceAlpha"
          result="hardAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        ></FeColorMatrix>
        <FeOffset dy="2"></FeOffset>
        <FeGaussianBlur stdDeviation="2"></FeGaussianBlur>
        <FeComposite in2="hardAlpha" operator="out"></FeComposite>
        <FeColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"></FeColorMatrix>
        <FeBlend
          in2="BackgroundImageFix"
          result="effect1_dropShadow_1732_168"
        ></FeBlend>
        <FeBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_1732_168"
          result="shape"
        ></FeBlend>
      </Filter>
    </Defs>
  </Svg>
);

export default ShopIcon;
