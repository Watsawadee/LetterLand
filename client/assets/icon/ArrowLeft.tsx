import * as React from "react";
import { SvgProps } from "react-native-svg";

const ArrowLeft = (props: SvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={48}
    height={48}
    viewBox="0 0 24 24"
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="m14 7l-5 5l5 5"
    ></path>
  </svg>
);

export default ArrowLeft;
