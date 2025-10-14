// app/(screens)/Publicboard.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";

import GardenBackgroundBlueSky from "@/assets/backgroundTheme/GardenBackgroundBlue";
import WordBankModal from "@/components/WordBank";
import { ButtonStyles } from "@/theme/ButtonStyles";
import { Typography } from "@/theme/Font";
import PublicGames from "@/components/publicgame"; // keep your existing path
import UserOverviewCard from "@/components/UserOverViewCard";
import UserSettingCard from "@/components/UserSettingCard";
import Book from "@/assets/icon/Book";
import ArrowLeft from "@/assets/icon/ArrowLeft";

// 🔎 search UI + API
import FloatingSearch from "@/components/Searchbar";
import api from "@/services/api";

export default function Publicboard() {
  const router = useRouter();
  const [showBook, setShowBook] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const { width } = useWindowDimensions();
  const isWide = width >= 1024;

  // --- search state ---
  const [gameName, setGameName] = useState("");
  const [difficulty, setDifficulty] = useState(""); // A1..C2 or ""
  const [hasSearched, setHasSearched] = useState(false);
  const [whitelistIds, setWhitelistIds] = useState<number[] | null>(null);

  const handleBackPress = () => router.push("/Home");

  // --- run backend search, collect template IDs ---
  const runSearch = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (gameName.trim()) params.q = gameName.trim();  // supports q or gameName
      if (difficulty) params.levels = difficulty;       // supports levels or difficulty

      const { data } = await api.get("/search/search-games", { params });
      const list: { id: number }[] = data?.games ?? [];

      setWhitelistIds(list.map((g) => g.id));
      setHasSearched(true);
    } catch (err) {
      console.error("search failed:", err);
      setWhitelistIds([]); // show empty state
      setHasSearched(true);
    }
  }, [gameName, difficulty]);

  // 👉 auto-search when CEFR tag changes (and reset when cleared)
  useEffect(() => {
    if (difficulty) {
      runSearch();
      return;
    }
    // if level is cleared…
    if (!gameName.trim()) {
      // …and no text, reset to default feed
      setWhitelistIds(null);
      setHasSearched(false);
    } else {
      // …but still has text -> search by text only
      runSearch();
    }
  }, [difficulty, gameName, runSearch]);

  return (
    <View style={styles.root}>
      <GardenBackgroundBlueSky style={styles.bg} />

      <View style={[styles.page, { flexDirection: isWide ? "row" : "column" }]}>
        {/* LEFT PANEL */}
        <View
          style={[
            styles.leftPanel,
            { marginRight: isWide ? 24 : 0, marginBottom: isWide ? 0 : 24 },
          ]}
        >
          {/* Header Row */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
              <ArrowLeft width={24} height={24} />
              <Text style={[Typography.header30, { marginLeft: 4 }]}>Public Board</Text>
            </TouchableOpacity>

            <View style={styles.controlsRight}>
  {/* only search bar gets marginTop */}
  <View style={{ width: isWide ? 360 : 240, marginTop: 0 }}>
    <FloatingSearch
      value={gameName}
      onChangeText={(txt) => {
        setGameName(txt);
        if (!txt.trim() && !difficulty) {
          setWhitelistIds(null);
          setHasSearched(false);
        }
      }}
      level={difficulty}
      onChangeLevel={(lv) => setDifficulty(lv)}
      onSubmit={runSearch}
    />
  </View>

  {/* Word Bank button stays unchanged */}
  <TouchableOpacity
    style={[
      ButtonStyles.wordBank.container,
      { flexDirection: "row", alignItems: "center" },
    ]}
    onPress={() => setShowBook(true)}
  >
    <Book width={50} height={50} style={{ marginRight: 4 }} />
    <View style={{ flexDirection: "column", alignItems: "flex-start", paddingLeft: 8 }}>
      <Text style={ButtonStyles.wordBank.text}>Word</Text>
      <Text style={ButtonStyles.wordBank.text}>Bank</Text>
    </View>
  </TouchableOpacity>

  <WordBankModal visible={showBook} onClose={() => setShowBook(false)} />
</View>

          </View>

          {/* Main Area — reuse PublicGames with optional whitelist */}
          <View style={styles.publicGamesContainer}>
            {hasSearched ? (
              <PublicGames title=" " whitelistIds={whitelistIds} />
            ) : (
              <PublicGames title=" " />
            )}
          </View>
        </View>

        {/* RIGHT PANEL */}
        <View style={styles.rightPanel}>
          {showSettings ? (
            <UserSettingCard onBack={() => setShowSettings(false)} />
          ) : (
            <UserOverviewCard onOpenSettings={() => setShowSettings(true)} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
  },
  bg: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: 1000,
    zIndex: 0,
  },
  page: {
    flex: 1,
    width: "100%",
    maxWidth: 1125,
    maxHeight: 850,
    paddingHorizontal: 0,
    paddingTop: 16,
    paddingBottom: 24,
    flexDirection: "row",
    minHeight: 0,
  },
  leftPanel: {
    flex: 2.5,
    borderRadius: 20,
    padding: 16,
    minHeight: 0,
  },
  rightPanel: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",  // vertical centering with title
    gap: 12,
    marginBottom: 8,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 0,
    marginLeft: -8,
  },
  controlsRight: {
    flexDirection: "row",
    alignItems: "center",  // same baseline as the title
    gap: 12,
  },
  publicGamesContainer: {
    flexDirection: "column",
    gap: 16,
    flex: 1,
    minHeight: 0,
    marginTop: 8,
  },
});
