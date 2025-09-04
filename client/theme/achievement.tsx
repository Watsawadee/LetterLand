import { StyleSheet } from "react-native";

export const AchievementCardStyles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    width: 220,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // top icon
  iconWrap: { alignSelf: "center", marginBottom: 12 },
  iconImage: { width: 72, height: 72, borderRadius: 16 },
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
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    color: "#333",
  },
  description: {
    marginTop: 6,
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    lineHeight: 18,
  },

  // coin row (centered)
  coinRow: {
    marginTop: 6,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  coinIcon: {
    width: 18,
    height: 18,
    marginRight: 4,
  },
  coinText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F4A300",
  },

  // progress bar
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressTrack: {
    flex: 1,
    height: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.20,
    shadowRadius: 3,
    elevation: 2,
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
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 9999,
    alignSelf: "center",
    backgroundColor: "#2F80ED",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#2F80ED",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 2,
  },
  claimTextStrong: {
    color: "white",
    fontSize: 18,
    fontWeight: "800",
  },
  claimCoinWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  claimCoinValue: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },

  // claimed pill
  claimedPill: {
    marginTop: 14,
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
