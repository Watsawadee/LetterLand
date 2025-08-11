import React from "react";
import Svg, { G, Path, Rect, Defs, ClipPath, SvgProps } from "react-native-svg";

const GardenBackground = (props: SvgProps) => (
    <Svg
        viewBox="0 0 1196 836"
        fill="none"
        preserveAspectRatio="xMidYMin slice"
        {...props}
    >
        <G clipPath="url(#clip0)">
            <Path fill="#F2F8F9" d="M0 833.998 1.288-.001l1193.999 1.844-1.288 834z" />
            <Path
                fill="#9EDBB3"
                d="M2.333 651.808c174-90.501 861.5 160.999 1192.997 0 331.5-161 0 184 0 184H2.333s-174-93.5 0-184Z"
            />
            <Rect width={6} height={40} x={53} y={741.999} fill="#71CB86" rx={3} />
            <Rect width={6} height={24} x={43} y={757.999} fill="#71CB86" rx={3} />
            <Rect width={6} height={30} x={63} y={752.001} fill="#71CB86" rx={3} />
            <Rect width={6} height={30} x={299.044} y={659.04} fill="#71CB86" rx={3} />
            <Path
                fill="#71CB86"
                d="M323.044 662.04a3 3 0 1 1 6 0v24a3 3 0 1 1-6 0v-24Z"
            />
            <Rect
                width={6}
                height={30}
                x={324.845}
                y={658.04}
                fill="#71CB86"
                rx={3}
                transform="rotate(29.56 324.845 658.04)"
            />
            <Rect
                width={6}
                height={30}
                x={298.044}
                y={661}
                fill="#71CB86"
                rx={3}
                transform="rotate(-29.556 298.044 661)"
            />
            <Rect width={6} height={40} x={618} y={663.999} fill="#71CB86" rx={3} />
            <Rect width={6} height={24} x={608} y={679.997} fill="#71CB86" rx={3} />
            <Rect width={6} height={30} x={628} y={673.997} fill="#71CB86" rx={3} />
            <Rect width={5} height={30} x={1055} y={745.999} fill="#71CB86" rx={2.5} />
            <Rect
                width={5}
                height={19}
                x={1055}
                y={750.999}
                fill="#71CB86"
                rx={2.5}
                transform="rotate(-90 1055 750.999)"
            />
            <Rect
                width={5}
                height={16}
                x={1055}
                y={763.999}
                fill="#71CB86"
                rx={2.5}
                transform="rotate(-90 1055 763.999)"
            />
            <Rect width={6} height={40} x={432} y={717.999} fill="#71CB86" rx={3} />
            <Rect width={6} height={24} x={441} y={734.001} fill="#71CB86" rx={3} />
            <Path
                stroke="#71CB86"
                strokeWidth={5}
                d="M720 764.499c6.192 0 11.5 5.431 11.5 12.5s-5.308 12.5-11.5 12.5-11.5-5.431-11.5-12.5 5.308-12.5 11.5-12.5Z"
            />
            <Rect width={6} height={40} x={946} y={694.999} fill="#71CB86" rx={3} />
            <Rect width={6} height={24} x={936} y={710.997} fill="#71CB86" rx={3} />
            <Rect width={6} height={40} x={875} y={791.999} fill="#71CB86" rx={3} />
            <Rect width={6} height={24} x={884} y={807.999} fill="#71CB86" rx={3} />
        </G>
        <Defs>
            <ClipPath id="clip0">
                <Path
                    fill="#fff"
                    d="M0 833.998 1.288-.001l1193.999 1.844-1.288 834z"
                />
            </ClipPath>
        </Defs>
    </Svg>
);

export default GardenBackground;
