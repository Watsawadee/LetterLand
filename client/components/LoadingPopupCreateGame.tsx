import { Color } from "@/theme/Color";
import { useEffect, useMemo, useRef, useState } from "react";
import { Modal, View, Text, ActivityIndicator, BackHandler, StyleSheet } from "react-native";
import { ProgressBar } from "react-native-paper";

type UploadType = "text" | "link" | "pdf";

type Props = {
    visible: boolean;
    uploadType: UploadType;
    progress?: number | null;
    lockBackButton?: boolean;
};

const baseFunny = [
    "Don’t quit the game… we’re cooking something spicy 🍲",
    "Loading… because Rome wasn’t built in a day ⏳",
    "Summoning words from the dictionary gods 📖✨",
    "Hold tight, the puzzle elves are working overtime 🧝‍♂️",
    "Almost there… don’t even think about rage quitting 😤",
    "We’re generating words faster than you can say ‘Suiiiiii’ ⚽️",
    "Stay hard! Good puzzles take time 💪",
    "Who’s gonna carry these letters? YOU are 🏋️‍♂️",
    "Patience builds champions — even in word games 🏆",
    "PDFs take longer, but you’re tougher than a PDF 📄🔥",
    "Don’t tap out — victory is around the corner 🎯",
    "Be uncommon: wait like a pro ⏳",
];


const byTypeExtra: Record<UploadType, string[]> = {
    text: [],
    link: [],
    pdf: ["Scoring goals is easier than parsing this PDF 📄⚽️"],
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const LoadingPopup = ({ visible, uploadType, progress, lockBackButton = true }: Props) => {
    // 🔹 Build the rotating list: start with Suiiiiii, then type-specific, then base
    const messages = useMemo(
        () => [
            "We’re generating words faster than you can say ‘Suiiiiii’ ⚽️",
            ...byTypeExtra[uploadType],
            ...baseFunny,
        ],
        [uploadType]
    );

    const [messageIndex, setMessageIndex] = useState(0);

    // --- rotate messages
    useEffect(() => {
        if (!visible) return;
        setMessageIndex(0);
        const id = setInterval(() => {
            setMessageIndex((i) => (i + 1) % messages.length);
        }, 3000);
        return () => clearInterval(id);
    }, [visible, messages]);

    // --- simulate progress if none provided
    const shouldSimulate = progress === undefined || progress === null;
    const [simulated, setSimulated] = useState(0.06);
    const simTickRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (!visible || !shouldSimulate) {
            setSimulated(0.06);
            if (simTickRef.current) clearInterval(simTickRef.current);
            simTickRef.current = null;
            return;
        }
        simTickRef.current = setInterval(() => {
            setSimulated((p) => clamp01(p + (p < 0.92 ? Math.random() * 0.03 : Math.random() * 0.005)));
        }, 200);
        return () => {
            if (simTickRef.current) clearInterval(simTickRef.current);
            simTickRef.current = null;
        };
    }, [visible, shouldSimulate]);

    const value = clamp01(shouldSimulate ? simulated : (progress as number));
    const percent = Math.round(value * 100);

    // --- optional: block Android back
    useEffect(() => {
        if (!visible || !lockBackButton) return;
        const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
        return () => sub.remove();
    }, [visible, lockBackButton]);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={() => { }}>
            <View style={styles.backdrop}>
                <View style={styles.card}>
                    <View style={styles.progressWrap}>
                        <ProgressBar progress={value}
                            color={Color.blue}
                        />
                        <Text style={styles.percent}>{percent}% • Generating your puzzle…</Text>
                    </View>
                    <View style={{ alignItems: "center" }}>
                        <Text
                        >
                            {messages[messageIndex]}
                        </Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        width: "100%",
        maxWidth: 520,
        alignItems: "center",
        elevation: 6,
    },
    progressWrap: { width: "100%", marginBottom: 8 },
    percent: { marginTop: 6, textAlign: "center", fontWeight: "600" },
    message: { marginTop: 12, textAlign: "center", fontSize: 16, fontWeight: "700", color: "#222" },
    tip: { marginTop: 6, fontSize: 12, color: "#6b7280", textAlign: "center" },
});

export default LoadingPopup;
