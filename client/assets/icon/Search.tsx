import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

const Search = (props: SvgProps) => (
  <Svg
    width="31"
    height="31"
    fill="none"
    viewBox="0 0 31 31"
  >
    <Path
      fill="#58A7F8"
      fillRule="evenodd"
      d="M20.703 18.699a9.375 9.375 0 1 0-1.985 1.99l5.172 5.158a1.408 1.408 0 0 0 2.332-.436 1.41 1.41 0 0 0-.347-1.555zm-7.547 1.014a6.563 6.563 0 1 0-.02-13.125 6.563 6.563 0 0 0 .02 13.125"
      clipRule="evenodd"
    ></Path>
  </Svg>
);

export default Search;
