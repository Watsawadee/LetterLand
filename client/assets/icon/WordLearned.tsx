import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

const WordLearned = (props: SvgProps) => (
  <Svg width={45} height={45} viewBox="0 0 45 45" fill="none" {...props}>
    <Path
      fill="rgba(239, 137, 196, 0.7)"
      d="M22.5 22.5 5.715 15.795 6.75 40.5h-4.5l1.08-25.672L0 13.5l22.5-9 22.5 9zm0-11.25c-1.238 0-2.25.495-2.25 1.125S21.262 13.5 22.5 13.5s2.25-.495 2.25-1.125-1.012-1.125-2.25-1.125m0 13.5 12.532-5.017a15.7 15.7 0 0 1 3.06 7.424A16 16 0 0 0 36 27c-5.738 0-10.755 3.082-13.5 7.672A15.73 15.73 0 0 0 9 27c-.72 0-1.418.067-2.093.157a15.7 15.7 0 0 1 3.06-7.424z"
    ></Path>
  </Svg>
);

export default WordLearned;
