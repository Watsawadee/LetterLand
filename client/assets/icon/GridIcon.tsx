import * as React from "react";
import Svg, { Rect, SvgProps } from "react-native-svg";

type GridIconProps = SvgProps & {
    grid?: number;         // number of rows/cols (default 8)
    cell?: number;         // square size
    gap?: number;          // spacing between squares
    color?: string;        // fill color
    radius?: number;       // corner radius
};

const GridIcon: React.FC<GridIconProps> = ({
    grid = 8,
    cell = 13.279,
    gap = 1.967,          // matches your SVG spacing (15.246 - 13.279)
    color = "#71CB86",
    radius = 3,
    ...svgProps
}) => {
    const size = grid * cell + (grid - 1) * gap; // overall width/height

    const rects = [];
    for (let r = 0; r < grid; r++) {
        for (let c = 0; c < grid; c++) {
            const x = c * (cell + gap);
            const y = r * (cell + gap);
            rects.push(
                <Rect
                    key={`${r}-${c}`}
                    x={x}
                    y={y}
                    width={cell}
                    height={cell}
                    rx={radius}
                    fill={color}
                />
            );
        }
    }

    return (
        <Svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} {...svgProps}>
            {rects}
        </Svg>
    );
};

export default GridIcon;
