// components/icons/PlainTextIcon.tsx
import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

type PlainTextIconProps = SvgProps & { size?: number; fill?: string };

const PlainTextIcon: React.FC<PlainTextIconProps> = ({ size = 33, fill = "#5B6073", ...props }) => (
    <Svg width={size} height={size} viewBox="0 0 33 33" fill="none" {...props}>
        <Path
            fill={fill}
            d="M5.5 27.501q-1.134 0-1.941-.807a2.65 2.65 0 0 1-.809-1.943v-16.5q0-1.134.809-1.942A2.66 2.66 0 0 1 5.5 5.501h22q1.134 0 1.943.808.809.81.807 1.942v16.5q0 1.134-.807 1.943a2.64 2.64 0 0 1-1.943.807zm2.75-4.125h16.5q.584 0 .98-.396t.395-.979q0-.583-.396-.979a1.33 1.33 0 0 0-.979-.396H8.25q-.585 0-.979.396t-.396.979q0 .583.396.98.397.398.979.395m0-5.5h16.5q.584 0 .98-.396t.395-.979q0-.583-.396-.979a1.33 1.33 0 0 0-.979-.396H8.25q-.585 0-.979.396t-.396.979q0 .583.396.98.397.398.979.395m0-5.5h11q.585 0 .98-.396.396-.396.395-.979 0-.583-.396-.979a1.33 1.33 0 0 0-.979-.396h-11q-.585 0-.979.396t-.396.979q0 .583.396.98.397.398.979.395"
        />
    </Svg>
);

export default PlainTextIcon;
