import { StyleSheet } from "react-native";
import { Color } from "./Color";
import { Typography } from "./Font";

export const AchievementCardStyles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    width: 210,
    height: 253,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginRight: 20,
    marginTop: 20,
  },

  // top icon
  iconWrap: { alignSelf: "center", marginBottom: 12 },
  iconImage: { width: 160, height: 70, borderRadius: 16 },
  iconFallback: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: "#FFF3E0",
    alignItems: "center",
    justifyContent: "center",
  },
  iconFallbackText: { fontSize: 34 },

  // title + description
  title: {
    ...Typography.header16,
    fontWeight: "700",
    textAlign: "center",
    color: "#333",
  },
  description: {
    marginTop: 7,
    ...Typography.body13,
    color: "#666",
    textAlign: "center",
    lineHeight: 18,
  },

  // coin row (centered)
  coinRow: {
    marginTop: 18,
    marginBottom: 8.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  coinIcon: {
    width: 22,
    height: 22,
    marginRight: 4,
  },
  coinText: {
    ...Typography.header20,
    fontWeight: "700",
    color: "#F4A300",
  },

  // progress bar
  progressRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressTrack: {
    flex: 1,
    height: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2.5,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#E86EA3",
    borderRadius: 999,
  },
  progressLabel: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: "500",
    color: "#2F3441",
  },

  // claim button
  claimPill: {
    marginTop: 25,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 9999,
    alignSelf: "center",
    backgroundColor: Color.blue,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#2F80ED",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 2,
  },
  claimTextStrong: {
    color: "white",
    ...Typography.header16,
    fontWeight: "800",
  },
  claimCoinWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  claimCoinValue: {
    color: Color.white,
    ...Typography.header16,
    fontWeight: "700",
  },

  // claimed pill
  claimedPill: {
    marginTop: 25,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 9999,
    alignSelf: "center",
    backgroundColor: "#E6E8EC",
  },
  claimedText: {
    color: "#6B7280",
    fontWeight: "700",
  },
});
