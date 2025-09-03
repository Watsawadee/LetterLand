// components/icons/LinkIcon.tsx
import React from "react";
import Svg, { G, Path, Defs, ClipPath, Rect, SvgProps } from "react-native-svg";

type LinkIconProps = SvgProps & { size?: number; fill?: string };

const LinkIcon: React.FC<LinkIconProps> = ({ size = 38, fill = "#5B6073", ...props }) => (
    <Svg width={size} height={size} viewBox="0 0 38 38" fill="none" {...props}>
        <G fill={fill} clipPath="url(#clip0_932_849)">
            <Path d="m14.701 21.64 7.253-6.984 2.328 2.418-7.253 6.984z" />
            <Path d="m20.565 25.312-1.473 1.42a4.674 4.674 0 0 1-6.6-.125l-.51-.53a4.673 4.673 0 0 1 .125-6.599l1.474-1.419-2.328-2.417-1.474 1.419a8.02 8.02 0 0 0-.214 11.344l.51.53a8.023 8.023 0 0 0 11.345.214l1.473-1.42zM17.562 9.566l-1.474 1.42 2.328 2.417 1.474-1.419a4.674 4.674 0 0 1 6.599.125l.51.53a4.674 4.674 0 0 1-.125 6.598l-1.473 1.419 2.328 2.418 1.473-1.42a8.02 8.02 0 0 0 .214-11.344l-.51-.53a8.02 8.02 0 0 0-11.344-.213" />
        </G>
        <Defs>
            <ClipPath id="clip0_932_849">
                <Rect
                    width={26.851}
                    height={26.851}
                    y={18.626}
                    fill="#fff"
                    rx={13.425}
                    transform="rotate(-43.92 0 18.626)"
                />
            </ClipPath>
        </Defs>
    </Svg>
);

export default LinkIcon;
