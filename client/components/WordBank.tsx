// SvgIcon.js

import React from 'react';
import { Svg, Path, Rect, Defs, ClipPath, SvgProps } from 'react-native-svg';

const SvgIcon = (props: SvgProps) => (
  <Svg
    width={574}
    height={377}
    viewBox="0 0 574 377"
    fill="none"
    {...props}
  >
    <Path
      fill="#F95725"
      d="M0 48L71.75 1h143.5L287 26.405 358.75 1h143.5L574 48v329h-71.75l-71.75-10.797-81.274-10.798L287 377l-71.75-21.595-71.75 10.798L71.75 377H0V48z"
    />
    <Path
      fill="#D9D9D9"
      d="M19 35.562 45.038 18.416 71.076 1.27H220l67 23.428L354 1.27h67L503.559 0l26.673 18.416L555 35.562V348h-67l-67-9.957-75.894-9.957-29.053 9.957-14.526 4.979-7.264 2.489-3.263.989-4 .5-4.188-.495-4.187-.994-8.375-2.489-16.75-4.979-33.5-9.957-67 9.957L86 348H19V35.562z"
    />
    <Path
      fill="#fff"
      d="M33 26.047 52.685 12.706 70.5.5H223l64 22.495L351.5.5H414l89.535-.5 20.32 13.977L541 26.047V324h-63.5l-63.5-9.27-71.929-9.27L287 324l-63.5-18.54-63.5 9.27L96.5 324H33V26.047z"
    />
    <Path fill="#B5B5B5" d="M19 35.527 33 26v297.231L19 348zM541 26l14 9.527V348l-14-24.134z" />
    <Path
      fill="#5B6073"
      d="M220.097 327 287 347.513v29.121l-2.25-.315-2.25-.681-4.5-1.362-9-2.725-18-5.448-36-10.898zM287 347.513 344.571 327 349 355.205l-31 10.898-15.5 5.448-7.75 2.725-3.875 1.362-1.938.681-1.937.367z"
    />
    <Path fill="#E5E7EB" d="M284 22h5v301h-5z" />
    {/* You can remove all text paths below if you want a BLANK book only */}
    <Rect
      width={25}
      height={25}
      x={69.998}
      y={176.291}
      fill="#E5E7EB"
      rx={12.5}
      transform="rotate(-179.16 69.998 176.291)"
    />
    <Rect
      width={5}
      height={5}
      x={279}
      y={290.072}
      fill="#5B6073"
      rx={2.5}
      transform="rotate(-179.16 279 290.072)"
    />
    <Rect
      width={5}
      height={5}
      x={289}
      y={290.072}
      fill="#A7A8AC"
      rx={2.5}
      transform="rotate(-179.16 289 290.072)"
    />
    <Rect
      width={5}
      height={5}
      x={299}
      y={290.072}
      fill="#A7A8AC"
      rx={2.5}
      transform="rotate(-179.16 299 290.072)"
    />
    <Rect
      width={25}
      height={25}
      x={502}
      y={153.008}
      fill="#E5E7EB"
      rx={12.5}
      transform="rotate(-.018 502 153.008)"
    />
    <Path
      fill="#5B6073"
      d="M511.058 159.243a1 1 0 0 0 .017 1.413l5.009 4.891-4.89 5.009a1 1 0 0 0 1.431 1.397l5.589-5.725a1 1 0 0 0-.017-1.414l-5.725-5.588a1 1 0 0 0-1.414.017z"
    />
    <Defs>
      <ClipPath id="clip0">
        <Path fill="#fff" d="M48 172.047h16v-16h-16z" />
      </ClipPath>
    </Defs>
  </Svg>
);

export default SvgIcon;
