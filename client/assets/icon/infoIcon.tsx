import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

type Props = SvgProps & {
    size?: number;
    color?: string;
};

const InfoIcon = ({ size = 17, color = "#5B6073", ...props }: Props) => (
    <Svg
        width={size}
        height={size}
        viewBox="0 0 17 17"
        fill="none"
        {...props}
    >
        <Path
            fill={color}
            d="M8.621 11.555v-4h-2v1h1v3h-1.5v1h4v-1zm-.5-7a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5"
        />
        <Path
            fill={color}
            d="M8.121 15.555a7 7 0 1 1 0-14 7 7 0 0 1 0 14m0-13a6 6 0 1 0 0 12 6 6 0 0 0 0-12"
        />
    </Svg>
);

export default React.memo(InfoIcon);
