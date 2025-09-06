import * as React from "react";
import Svg, { Path, G, Defs, ClipPath, SvgProps } from "react-native-svg";

const OneHint = (props: SvgProps) => (
  <Svg width={52} height={52} viewBox="0 0 52 52" fill="none" {...props}>
    <G clipPath="url(#clip0_900_771)">
      <Path
        fill="#9AAAB4"
        d="m39.56 35.594-4.085 4.085-7.15-7.15 4.085-4.085z"
      />
      <Path
        fill="#66757F"
        d="m50.097 42.048-8.492-8.492a2.89 2.89 0 0 0-4.084 0l-4.085 4.085a2.89 2.89 0 0 0 0 4.085l8.492 8.492a5.777 5.777 0 1 0 8.17-8.17"
      />
      <Path
        fill="#8899A6"
        d="M19.624 39.244c10.77 0 19.5-8.73 19.5-19.5s-8.73-19.5-19.5-19.5-19.5 8.73-19.5 19.5 8.73 19.5 19.5 19.5"
      />
      <Path
        fill="#E1F3F6"
        d="M19.625 33.466c7.578 0 13.722-6.143 13.722-13.722S27.203 6.022 19.625 6.022c-7.579 0-13.723 6.143-13.723 13.722s6.144 13.722 13.723 13.722"
      />
    </G>
    <Defs>
      <ClipPath id="clip0_900_771">
        <Path fill="#fff" d="M0 0h52v52H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);

export default OneHint;
