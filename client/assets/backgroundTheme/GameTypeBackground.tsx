import * as React from "react";
import Svg, { Rect, Path, SvgProps } from "react-native-svg";

type GameTypeBackgroundProps = SvgProps & {
    bgColor?: string;   // main backdrop color
    accent?: string;    // stems/leaves color
};

const GameTypeBackground: React.FC<GameTypeBackgroundProps> = ({
    bgColor = "#9EDBB3",
    accent = "#71CB86",
    width = 436,
    height = 400,
    ...props
}) => {
    return (
        <Svg viewBox="0 0 436 400" width={width} height={height} fill="none" {...props}>
            <Path fill={bgColor} d="M0 26h436v400H0z" />

            <Rect width={6} height={38} x={393} rx={3} fill={accent} />
            <Rect
                width={6}
                height={19.723}
                x={396.838}
                y={28.193}
                rx={3}
                fill={accent}
                transform="rotate(-129.756 396.838 28.193)"
            />
            <Rect
                width={6}
                height={18.189}
                x={412.619}
                y={36.196}
                rx={3}
                fill={accent}
                transform="rotate(152.928 412.619 36.196)"
            />

            <Rect width={6} height={40} x={26} y={14} rx={3} fill={accent} />
            <Rect width={6} height={24} x={16} y={30} rx={3} fill={accent} />
            <Rect width={6} height={30} x={36} y={24} rx={3} fill={accent} />

            <Rect width={6} height={30} x={242} y={40} rx={3} fill={accent} />
            <Path fill={accent} d="M266 43a3 3 0 1 1 6 0v24a3 3 0 1 1-6 0z" />
            <Rect
                width={6}
                height={30}
                x={267.801}
                y={39}
                rx={3}
                fill={accent}
                transform="rotate(29.56 267.801 39)"
            />
            <Rect
                width={6}
                height={30}
                x={241}
                y={41.96}
                rx={3}
                fill={accent}
                transform="rotate(-29.556 241 41.96)"
            />

            <Rect width={6} height={40} x={380} y={326} rx={3} fill={accent} />
            <Rect width={6} height={30} x={390} y={336} rx={3} fill={accent} />
            <Rect width={6} height={30} x={421} y={186} rx={3} fill={accent} />

            <Rect width={6} height={16} x={28} y={261} rx={3} fill={accent} />
            <Rect width={6} height={24} x={37} y={253} rx={3} fill={accent} />
        </Svg>
    );
};

export default React.memo(GameTypeBackground);
