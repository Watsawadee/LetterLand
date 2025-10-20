import * as React from "react";
import Svg, { Path, G, SvgProps } from "react-native-svg";

type FireProps = SvgProps & {
    size?: number;
};

const Fire = ({ size, width, height, ...props }: FireProps) => {
    const w = typeof size === "number" ? size : width ?? 40;
    const h = typeof size === "number" ? size : height ?? 40;

    return (
        <Svg
            width={w}
            height={h}
            viewBox="-2.4 -2.4 28.8 28.8"
            fill="none"
            stroke="#FF4500"
            strokeWidth={1.032}
            {...props}
        >
            <G fill="#FF8C00">
                <Path
                    d="M12.832 21.801c3.126-.626 7.168-2.875 7.168-8.69 
             0-5.291-3.873-8.815-6.658-10.434-.619-.36-1.342.113-1.342.828v1.828
             c0 1.442-.606 4.074-2.29 5.169-.86.559-1.79-.278-1.894-1.298l-.086-.838
             c-.1-.974-1.092-1.565-1.87-.971C4.461 8.46 3 10.33 3 13.11
             c0 7.111 5.289 8.89 7.933 8.89q.232 0 .484-.015
             c.446-.056 0 .099 1.415-.185Z"
                    opacity={0.5}
                />
                <Path
                    d="M8 18.444c0 2.62 2.111 3.43 3.417 3.542
             .446-.056 0 .099 1.415-.185
             C13.871 21.434 15 20.492 15 18.444
             c0-1.297-.819-2.098-1.46-2.473
             -.196-.115-.424.03-.441.256
             -.056.718-.746 1.29-1.215.744
             -.415-.482-.59-1.187-.59-1.638v-.59
             c0-.354-.357-.59-.663-.408
             C9.495 15.008 8 16.395 8 18.445Z"
                />
            </G>
        </Svg>
    );
};

export default Fire;
