// import { Color } from "@/theme/Color";
// import { useEffect, useMemo, useRef, useState } from "react";
// import { Modal, View, Text, ActivityIndicator, BackHandler, StyleSheet } from "react-native";
// import { ProgressBar } from "react-native-paper";

// type UploadType = "text" | "link" | "pdf";

// type Props = {
//     visible: boolean;
//     uploadType: UploadType;
//     progress?: number | null;
//     lockBackButton?: boolean;
// };

// const baseFunny = [
//     "Don’t quit the game… we’re cooking something spicy 🍲",
//     "Loading… because Rome wasn’t built in a day ⏳",
//     "Summoning words from the dictionary gods 📖✨",
//     "Hold tight, the puzzle elves are working overtime 🧝‍♂️",
//     "Almost there… don’t even think about rage quitting 😤",
//     "We’re generating words faster than you can say ‘Suiiiiii’ ⚽️",
//     "Stay hard! Good puzzles take time 💪",
//     "Who’s gonna carry these letters? YOU are 🏋️‍♂️",
//     "Patience builds champions — even in word games 🏆",
//     "PDFs take longer, but you’re tougher than a PDF 📄🔥",
//     "Don’t tap out — victory is around the corner 🎯",
//     "Be uncommon: wait like a pro ⏳",
// ];


// const byTypeExtra: Record<UploadType, string[]> = {
//     text: [],
//     link: [],
//     pdf: ["Scoring goals is easier than parsing this PDF 📄⚽️"],
// };

// const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// const LoadingPopup = ({ visible, uploadType, progress, lockBackButton = true }: Props) => {
//     // 🔹 Build the rotating list: start with Suiiiiii, then type-specific, then base
//     const messages = useMemo(
//         () => [
//             "We’re generating words faster than you can say ‘Suiiiiii’ ⚽️",
//             ...byTypeExtra[uploadType],
//             ...baseFunny,
//         ],
//         [uploadType]
//     );

//     const [messageIndex, setMessageIndex] = useState(0);

//     // --- rotate messages
//     useEffect(() => {
//         if (!visible) return;
//         setMessageIndex(0);
//         const id = setInterval(() => {
//             setMessageIndex((i) => (i + 1) % messages.length);
//         }, 3000);
//         return () => clearInterval(id);
//     }, [visible, messages]);

//     // --- simulate progress if none provided
//     const shouldSimulate = progress === undefined || progress === null;
//     const [simulated, setSimulated] = useState(0.06);
//     const simTickRef = useRef<ReturnType<typeof setInterval> | null>(null);

//     useEffect(() => {
//         if (!visible || !shouldSimulate) {
//             setSimulated(0.06);
//             if (simTickRef.current) clearInterval(simTickRef.current);
//             simTickRef.current = null;
//             return;
//         }
//         simTickRef.current = setInterval(() => {
//             setSimulated((p) => clamp01(p + (p < 0.92 ? Math.random() * 0.03 : Math.random() * 0.005)));
//         }, 200);
//         return () => {
//             if (simTickRef.current) clearInterval(simTickRef.current);
//             simTickRef.current = null;
//         };
//     }, [visible, shouldSimulate]);

//     const value = clamp01(shouldSimulate ? simulated : (progress as number));
//     const percent = Math.round(value * 100);

//     // --- optional: block Android back
//     useEffect(() => {
//         if (!visible || !lockBackButton) return;
//         const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
//         return () => sub.remove();
//     }, [visible, lockBackButton]);

//     return (
//         <Modal visible={visible} transparent animationType="fade" onRequestClose={() => { }}>
//             <View style={styles.backdrop}>
//                 <View style={styles.card}>
//                     <View style={styles.progressWrap}>
//                         <ProgressBar progress={value}
//                             color={Color.blue}
//                         />
//                         <Text style={styles.percent}>{percent}% • Generating your puzzle…</Text>
//                     </View>
//                     <View style={{ alignItems: "center" }}>
//                         <Text
//                         >
//                             {messages[messageIndex]}
//                         </Text>
//                     </View>
//                 </View>
//             </View>
//         </Modal>
//     );
// };

// const styles = StyleSheet.create({
//     backdrop: {
//         flex: 1,
//         backgroundColor: "rgba(0,0,0,0.6)",
//         justifyContent: "center",
//         alignItems: "center",
//         paddingHorizontal: 24,
//     },
//     card: {
//         backgroundColor: "#fff",
//         borderRadius: 16,
//         padding: 16,
//         width: "100%",
//         maxWidth: 520,
//         alignItems: "center",
//         elevation: 6,
//     },
//     progressWrap: { width: "100%", marginBottom: 8 },
//     percent: { marginTop: 6, textAlign: "center", fontWeight: "600" },
//     message: { marginTop: 12, textAlign: "center", fontSize: 16, fontWeight: "700", color: "#222" },
//     tip: { marginTop: 6, fontSize: 12, color: "#6b7280", textAlign: "center" },
// });

// export default LoadingPopup;

import CompleteGame from "@/assets/backgroundTheme/CompleteGame";
import BoxingGlove from "@/assets/icon/BoxingGlove";
import Coin from "@/assets/icon/Coin";
import Fire from "@/assets/icon/Fire";
import { Magnify } from "@/assets/icon/Magnify";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    Modal,
    PanResponder,
    StyleSheet,
    Text,
    View,
    LayoutChangeEvent,
} from "react-native";
import { ProgressBar } from "react-native-paper";

type Props = { visible: boolean; message?: string; progress?: number };

const TIPS = [
    "Did you know? Extra words earn bonus coins!",
    "Pro tip: Use diagonal drags for tricky words.",
    "Your brain is stretching... hold on!",
    "Fun fact: A2–B2 levels unlock larger boards.",
];

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

type ComponentName = "CompleteGame" | "Coin" | "Fire" | "BoxingGlove" | "Magnify";

type BubbleLabel =
  | { kind: "emoji"; value: string }
  | {
      kind: "component";
      name: ComponentName;
      props?: Record<string, any>;
      scale?: number;
    };

const ICON_REGISTRY: Record<ComponentName, React.ComponentType<any>> = {
  CompleteGame,
  Coin,
  Fire,
  BoxingGlove,
  Magnify,
};

type BubbleInst = {
    id: number;
    label: BubbleLabel;
    size: number; // px diameter
    mass: number; // ~ area
    x: number; y: number;   // center coords
    vx: number; vy: number; // px/s
    ax: Animated.Value; ay: Animated.Value; // translate
    isDragging: boolean;
    startX: number; startY: number;
};

function renderLabel(label: BubbleLabel, size: number) {
    if (label.kind === "emoji") {
      return <Text style={{ fontSize: Math.max(20, size * 0.45) }}>{label.value}</Text>;
    }
    if (label.kind === "component") {
      const Cmp = ICON_REGISTRY[label.name];
      if (!Cmp) return null;
  
      const innerScale = label.scale ?? 0.8; // default similar to before
      const dim = size * innerScale;
  
      return (
        <View
          style={{
            width: dim,
            height: dim,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Cmp width="100%" height="100%" {...(label.props ?? {})} />
        </View>
      );
    }
    return null;
  }


/** Bubble view: input + visual (physics is outside) */
function BubbleView({ inst, boxW, boxH }: { inst: BubbleInst; boxW: number; boxH: number }) {
    const R = inst.size / 2;
    const halfW = boxW / 2;
    const halfH = boxH / 2;

    // highlight animation when dragging
    const scale = useRef(new Animated.Value(1)).current;

    const animateActive = (active: boolean) => {
        Animated.timing(scale, {
            toValue: active ? 1.08 : 1,
            duration: 140,
            useNativeDriver: true,
        }).start();
    };

    const responder = useMemo(
        () =>
            PanResponder.create({
                onStartShouldSetPanResponder: () => true,
                onMoveShouldSetPanResponder: () => true,
                onPanResponderGrant: () => {
                    inst.isDragging = true;
                    inst.startX = inst.x;
                    inst.startY = inst.y;
                    inst.vx = 0;
                    inst.vy = 0;
                    animateActive(true);
                },
                onPanResponderMove: (_evt, gs) => {
                    const nx = inst.startX + gs.dx;
                    const ny = inst.startY + gs.dy;
                    const cx = Math.max(-halfW + R, Math.min(halfW - R, nx));
                    const cy = Math.max(-halfH + R, Math.min(halfH - R, ny));
                    inst.x = cx;
                    inst.y = cy;
                    inst.ax.setValue(cx);
                    inst.ay.setValue(cy);
                },
                onPanResponderRelease: (_evt, gs) => {
                    inst.startX = inst.x;
                    inst.startY = inst.y;
                    inst.isDragging = false;
                    const fling = 140;
                    inst.vx = gs.vx * fling;
                    inst.vy = gs.vy * fling;
                    animateActive(false);
                },
                onPanResponderTerminate: () => {
                    // safety: same as release if gesture is cancelled
                    inst.isDragging = false;
                    animateActive(false);
                },
            }),
        [boxW, boxH, R, inst]
    );

    // dynamic styling when active
    const activeBorderWidth = inst.isDragging ? 2 : 0;
    const activeShadowOpacity = inst.isDragging ? 0.28 : 0.12;
    const activeElevation = inst.isDragging ? 12 : 6;

    return (
        <Animated.View
            {...responder.panHandlers}
            style={[
                styles.bubble,
                {
                    height: inst.size,
                    width: inst.size,
                    borderRadius: R,
                    shadowOpacity: activeShadowOpacity,
                    elevation: activeElevation,
                    transform: [{ translateX: inst.ax }, { translateY: inst.ay }, { scale }],
                },
            ]}
        >
            {renderLabel(inst.label, inst.size)}
        </Animated.View>
    );
}

const LoadingPopupCreateGame: React.FC<Props> = ({ visible, message, progress }) => {
    const [tipIndex, setTipIndex] = useState(0);
    useEffect(() => {
        if (!visible) return;
        const t = setInterval(() => setTipIndex((i) => (i + 1) % TIPS.length), 2200);
        return () => { clearInterval(t); };
    }, [visible]);

    const [box, setBox] = useState({ w: 0, h: 0 });
    const onLayout = (e: LayoutChangeEvent) => {
        const { width, height } = e.nativeEvent.layout;
        setBox({ w: width, h: height });
    };

    const instsRef = useRef<BubbleInst[]>([]);
    const [renderList, setRenderList] = useState<BubbleInst[]>([]);

    useEffect(() => {
        if (!visible || box.w === 0 || box.h === 0) return;

      const base: Array<{ id: number; label: BubbleLabel; size: number }> = [
  { id: 1, label: { kind: "component", name: "Coin", scale: 0.6 }, size: 64 },
  { id: 2, label: { kind: "component", name: "Fire" }, size: 56 },
  { id: 3, label: { kind: "component", name: "BoxingGlove" }, size: 52 },
  { id: 4, label: { kind: "component", name: "CompleteGame" }, size: 64 },
  { id: 5, label: { kind: "component", name: "Magnify", props: { strokeWidth: 1.5 } }, size: 56 },
  // you can still mix in emoji if you want:
  // { id: 6, label: { kind: "emoji", value: "⭐" }, size: 56 },
];

        const halfW = box.w / 2;
        const halfH = box.h / 2;

        const insts: BubbleInst[] = base.map((b) => {
            const R = b.size / 2;
            const x = Math.random() * (box.w - b.size) - (box.w - b.size) / 2;
            const y = Math.random() * (box.h - b.size) - (box.h - b.size) / 2;
            const xClamped = Math.max(-halfW + R, Math.min(halfW - R, x));
            const yClamped = Math.max(-halfH + R, Math.min(halfH - R, y));
            return {
                id: b.id,
                label: b.label,
                size: b.size,
                mass: Math.PI * R * R,
                x: xClamped,
                y: yClamped,
                vx: (Math.random() - 0.5) * 80,
                vy: (Math.random() - 0.5) * 80,
                ax: new Animated.Value(xClamped),
                ay: new Animated.Value(yClamped),
                isDragging: false,
                startX: xClamped,
                startY: yClamped,
            };
        });

        instsRef.current = insts;
        setRenderList(insts);
    }, [visible, box]);

    useEffect(() => {
        if (!visible || renderList.length === 0) return;

        const halfW = box.w / 2;
        const halfH = box.h / 2;

        const restitution = 0.92;
        const drag = 0.20;
        const gBase = 250;
        const buoyancyPeriod = 5.5;
        const buoyancyOmega = (2 * Math.PI) / buoyancyPeriod;

        let t0 = performance.now();
        let raf: number;

        const step = () => {
            const t1 = performance.now();
            const dt = Math.max(0.001, Math.min(0.033, (t1 - t0) / 1000));
            t0 = t1;

            const arr = instsRef.current;

            const timeSec = t1 / 1000;
            const g = gBase * Math.sin(timeSec * buoyancyOmega);

            // integrate + walls
            for (const b of arr) {
                if (!b.isDragging) {
                    b.vy += g * dt;
                    const damp = Math.exp(-drag * dt);
                    b.vx *= damp; b.vy *= damp;
                    b.x += b.vx * dt; b.y += b.vy * dt;

                    const R = b.size / 2;
                    if (b.x + R > halfW) { b.x = halfW - R; b.vx = -b.vx * restitution; }
                    else if (b.x - R < -halfW) { b.x = -halfW + R; b.vx = -b.vx * restitution; }
                    if (b.y + R > halfH) { b.y = halfH - R; b.vy = -b.vy * restitution; }
                    else if (b.y - R < -halfH) { b.y = -halfH + R; b.vy = -b.vy * restitution; }
                }
            }

            // collisions (dragged bubble is kinematic: others bounce off it)
            for (let i = 0; i < arr.length; i++) {
                for (let j = i + 1; j < arr.length; j++) {
                    const a = arr[i];
                    const b = arr[j];

                    const dx = b.x - a.x;
                    const dy = b.y - a.y;
                    const dist2 = dx * dx + dy * dy;
                    const minDist = (a.size + b.size) / 2;
                    if (dist2 === 0 || dist2 >= minDist * minDist) continue;

                    const dist = Math.sqrt(dist2);
                    const nx = dx / dist;
                    const ny = dy / dist;

                    // One dragged → reflect only the mover (non-dragged)
                    if (a.isDragging !== b.isDragging) {
                        const dragged = a.isDragging ? a : b;
                        const mover = a.isDragging ? b : a;

                        const overlap = minDist - dist + 0.1;
                        // push mover away from dragged along normal
                        mover.x += nx * (dragged === b ? -overlap : overlap);
                        mover.y += ny * (dragged === b ? -overlap : overlap);

                        // reflect mover velocity across normal
                        const vdotn = mover.vx * nx + mover.vy * ny;
                        if (vdotn <= 0) {
                            mover.vx = mover.vx - (1 + restitution) * vdotn * nx;
                            mover.vy = mover.vy - (1 + restitution) * vdotn * ny;
                        }
                        continue;
                    }

                    // Neither dragged → normal elastic collision
                    if (!a.isDragging && !b.isDragging) {
                        const overlap = minDist - dist + 0.1;
                        const totalMass = a.mass + b.mass;
                        const corrA = overlap * (b.mass / totalMass);
                        const corrB = overlap * (a.mass / totalMass);
                        a.x -= nx * corrA; a.y -= ny * corrA;
                        b.x += nx * corrB; b.y += ny * corrB;

                        const rvx = b.vx - a.vx;
                        const rvy = b.vy - a.vy;
                        const vn = rvx * nx + rvy * ny;
                        if (vn < 0) {
                            const jImp = -(1 + restitution) * vn / (1 / a.mass + 1 / b.mass);
                            const impX = jImp * nx;
                            const impY = jImp * ny;
                            a.vx -= impX / a.mass; a.vy -= impY / a.mass;
                            b.vx += impX / b.mass; b.vy += impY / b.mass;
                        }
                    }
                }
            }

            // sync
            arr.forEach((b) => {
                b.ax.setValue(b.x);
                b.ay.setValue(b.y);
            });

            raf = requestAnimationFrame(step);
        };

        raf = requestAnimationFrame(step);
        return () => { cancelAnimationFrame(raf); };
    }, [visible, renderList, box]);

    const msg = message ?? "Loading awesomeness…";

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
            <View style={styles.backdrop}>
                <View style={styles.card}>
                    {typeof progress === "number" && (
                        <View style={{ width: "100%", marginBottom: 8 }}>
                            <ProgressBar progress={clamp01(progress)} />
                            <Text style={styles.percent}>{Math.round(clamp01(progress) * 100)}%</Text>
                        </View>
                    )}
                    <Text style={styles.title}>{msg}</Text>

                    <View style={styles.bubbleBox} onLayout={onLayout}>
                        {box.w > 0 &&
                            instsRef.current.map((inst) => (
                                <BubbleView key={inst.id} inst={inst} boxW={box.w} boxH={box.h} />
                            ))}
                    </View>

                    <Text style={styles.tip}>{TIPS[tipIndex]}</Text>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.55)",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },
    card: {
        backgroundColor: "white",
        borderRadius: 18,
        width: "100%",
        maxWidth: 520,
        padding: 20,
        alignItems: "center",
        elevation: 8,
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
    },
    title: { fontSize: 18, fontWeight: "700", marginBottom: 14, textAlign: "center" },
    tip: { marginTop: 14, fontSize: 13, color: "#6b7280", textAlign: "center" },
    percent: { marginTop: 6, textAlign: "center", fontWeight: "600" },
    bubbleBox: {
        marginTop: 6,
        height: 220,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderRadius: 14,
        backgroundColor: "#f9fafb",
    },
    bubble: {
        position: "absolute",
        backgroundColor: "#f3f4f6",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
        // borderColor and width set dynamically when active
    },
});

export default LoadingPopupCreateGame;
