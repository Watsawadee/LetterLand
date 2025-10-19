import * as React from "react";
import Svg, { G, Path, SvgProps } from "react-native-svg";

type TrophyProps = SvgProps & {
    size?: number;
};

const Trophy = ({ size, width, height, ...props }: TrophyProps) => {
    const w = typeof size === "number" ? size : width ?? 40;
    const h = typeof size === "number" ? size : height ?? 40;

    return (
        <Svg
            width={w}
            height={h}
            viewBox="-2.4 -2.4 28.8 28.8"
            fill="none"
            stroke="#DAA520"
            strokeWidth={1.032}
            {...props}
        >
            <G fill="#FFD700">
                <Path
                    d="M19 3H5a1 1 0 0 0-1 1v2a5 5 0 0 0 4 4.9V11a5 5 0 0 0 4 4.9V18H9a1 1 0 0 0-1 1v1h8v-1a1 1 0 0 0-1-1h-3v-2.1A5 5 0 0 0 17 11v-.1A5 5 0 0 0 21 6V4a1 1 0 0 0-1-1ZM6 5h1v1a3 3 0 0 1-3-3h2v2Zm12 0h1V3h2a3 3 0 0 1-3 3Z"
                    opacity={0.9}
                />
                <Path
                    d="M9 20h6v2H9z"
                    fill="#FFC107"
                />
            </G>
        </Svg>
    );
};

export default Trophy;
