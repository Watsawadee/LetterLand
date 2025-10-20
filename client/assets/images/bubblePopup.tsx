import React, { useState } from "react";
import { Image } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withRepeat,
    withSequence,
    runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

type FloatingBubbleProps = {
    cardWidth: number;
    cardHeight: number;
    onPop?: () => void; // 🆕 add this
};

export const FloatingBubble: React.FC<FloatingBubbleProps> = ({ cardWidth, cardHeight, onPop }) => {
    const [visible, setVisible] = useState(true);
    const BUBBLE_SIZE = 100;

    // Start roughly in center
    const startX = (cardWidth - BUBBLE_SIZE) / 2;
    const startY = (cardHeight - BUBBLE_SIZE) / 2;

    const translateX = useSharedValue(startX);
    const translateY = useSharedValue(startY);
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);
    const offsetX = useSharedValue(startX);
    const offsetY = useSharedValue(startY);
    const floatY = useSharedValue(0);

    // Gentle floating motion
    floatY.value = withRepeat(
        withSequence(
            withTiming(-10, { duration: 2000 }),
            withTiming(10, { duration: 2000 })
        ),
        -1,
        true
    );

    const drag = Gesture.Pan()
        .onBegin(() => {
            offsetX.value = translateX.value;
            offsetY.value = translateY.value;
        })
        .onUpdate((e) => {
            const EXTRA_LEFT = 50;
            const EXTRA_BOTTOM = 120;

            const minX = -EXTRA_LEFT;
            const maxX = cardWidth - BUBBLE_SIZE;
            const minY = 0;
            const maxY = cardHeight - BUBBLE_SIZE + EXTRA_BOTTOM;

            const nextX = offsetX.value + e.translationX;
            const nextY = offsetY.value + e.translationY;
            translateX.value = Math.max(minX, Math.min(maxX, nextX));
            translateY.value = Math.max(minY, Math.min(maxY, nextY));
        });

    const tap = Gesture.Tap().onEnd(() => {
        scale.value = withSequence(
            withSpring(1.2, { damping: 10 }),
            withTiming(0, { duration: 200 }, () => {
                runOnJS(setVisible)(false);
                if (onPop) runOnJS(onPop)();
            })
        );
        opacity.value = withTiming(0, { duration: 200 });
    });

    const composed = Gesture.Simultaneous(drag, tap);

    const animatedStyle = useAnimatedStyle(() => ({
        position: "absolute",
        width: BUBBLE_SIZE,
        height: BUBBLE_SIZE,
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value + floatY.value },
            { scale: scale.value },
        ],
        opacity: opacity.value,
    }));

    if (!visible) return null;

    return (
        <GestureDetector gesture={composed}>
            <Animated.View style={animatedStyle}>
                <Image
                    source={require("@/assets/images/chameleonBubble.png")}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="contain"
                />
            </Animated.View>
        </GestureDetector>
    );
};
