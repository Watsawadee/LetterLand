import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

type CoinProps = SvgProps & {
  size?: number;
};

const Coin = ({ size, width, height, ...props }: CoinProps) => {
  const w = typeof size === "number" ? size : width ?? 40;
  const h = typeof size === "number" ? size : height ?? 40;

  return (
    <Svg width={w} height={h} viewBox="0 0 31 30" fill="none" {...props}>
      <Path
        fill="#F9C23C"
        d="M15.313 29.025c8.456 0 15.312-6.498 15.312-14.513S23.769 0 15.313 0C6.855 0 0 6.497 0 14.512s6.856 14.513 15.313 14.513"
      />
      <Path
        fill="#D3883E"
        opacity={0.53}
        d="M27.344 14.513c0 6.297-5.387 11.402-12.032 11.402-6.644 0-12.03-5.105-12.03-11.402 0-6.298 5.386-11.403 12.03-11.403 6.645 0 12.032 5.105 12.032 11.403m-5.119 4.032a.56.56 0 0 0-.214-.277.6.6 0 0 0-.344-.107h.033v-8.044c.47-.29.558-1.005-.01-1.326l-5.896-3.38a.83.83 0 0 0-.853 0l-5.907 3.38c-.568.32-.48 1.036-.022 1.326v8.055h-.12a.57.57 0 0 0-.558.404l-.382 1.296c-.11.352.175.705.557.705h13.618c.382-.01.667-.374.546-.736zm-11.397-8.303v7.92h1.816v-7.92zm3.62 0v7.92h1.849v-7.92zm3.665 0v7.92h1.771v-7.92z"
      />
    </Svg>
  );
};

export default Coin;
