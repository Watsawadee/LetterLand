import React, { useEffect } from "react";
import {
  Modal,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useGlobalLoading } from "@/contexts/GlobalLoadingContext";
import { useVideoPlayer, VideoView, type VideoSource } from "expo-video";
import { Color } from "@/theme/Color";

const LoadingVideo: VideoSource = require("@/assets/videos/LoadingCharacter.mp4");

const VIDEO_AR = 3 / 4;

export default function GlobalLoadingOverlay() {
  const { width: winW, height: winH } = useWindowDimensions();
  const { visible, message, progress } = useGlobalLoading();
  const isDeterminate =
    typeof progress === "number" && progress >= 0 && progress <= 1;

  const player = useVideoPlayer(LoadingVideo, (p) => {
    p.muted = true;
    p.loop = true;
    p.play();
  });

  useEffect(() => {
    return () => {
      try {
        player.pause?.();
      } catch {}
    };
  }, [player]);

  // SIZE SETTING
  const CARD_MAX_W = 250;
  const cardWidth = Math.min(CARD_MAX_W, winW - 48);

  const VIDEO_MAX_H = Math.round(winH * 0.25);
  const VIDEO_MIN_H = 220;
  const videoHeight = Math.max(
    VIDEO_MIN_H,
    Math.min(VIDEO_MAX_H, Math.round(cardWidth / VIDEO_AR))
  );

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
    >
      <View style={styles.backdrop}>
        <View style={[styles.card, { width: cardWidth }]}>
          <View style={[styles.videoBox, { height: videoHeight }]}>
            <VideoView
              player={player}
              pointerEvents="none"
              fullscreenOptions={{ enable: true }}
              allowsPictureInPicture={false}
              nativeControls={false}
              contentFit="cover"
              style={[styles.video, { backgroundColor: "transparent" }]}
            />
          </View>

          {isDeterminate ? (
            <>
              <View style={styles.meterTrack}>
                <View
                  style={[
                    styles.meterFill,
                    { width: `${Math.round((progress ?? 0) * 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.percentText}>
                {Math.round((progress ?? 0) * 100)}%
              </Text>
              {!!message && <Text style={styles.msg}>{message}</Text>}
            </>
          ) : (
            <>
              <ActivityIndicator size="large" />
              {!!message && <Text style={styles.msg}>{message}</Text>}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Color.overlay,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: Color.white,
    borderRadius: 20,
    padding: 24,
    gap: 18,
    ...Platform.select({
      ios: {
        shadowColor: Color.black,
        shadowOpacity: 0.18,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 6 },
    }),
  },
  videoBox: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: Color.white,
    alignItems: "center",
    justifyContent: "center",
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  meterTrack: {
    height: 10,
    width: "100%",
    borderRadius: 999,
    backgroundColor: "#ECECEC",
    overflow: "hidden",
  },
  meterFill: { height: "100%", backgroundColor: "#4C9EFF" },
  percentText: { alignSelf: "flex-end", fontWeight: "600" },
  msg: { textAlign: "center", fontSize: 16, color: Color.black, marginTop: 2 },
});
