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
import PublicGames from "@/components/publicgame";
import UserOverviewCard from "@/components/UserOverViewCard";
import UserSettingCard from "@/components/UserSettingCard";
import Book from "@/assets/icon/Book";
import ArrowLeft from "@/assets/icon/ArrowLeft";

import FloatingSearch from "@/components/Searchbar";
import api from "@/services/api";

// Updated FloatingSearch component with onExpandChange prop

export default function Publicboard() {
  const router = useRouter();
  const [showBook, setShowBook] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);

  const { width } = useWindowDimensions();
  const isWide = width >= 1024;

  const [gameName, setGameName] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [whitelistIds, setWhitelistIds] = useState<number[] | null>(null);

  const handleBackPress = () => router.push("/Home");

  const runSearch = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (gameName.trim()) params.q = gameName.trim();
      if (difficulty) params.levels = difficulty;

      const { data } = await api.get("/search/search-games", { params });
      const list: { id: number }[] = data?.games ?? [];

      setWhitelistIds(list.map((g) => g.id));
      setHasSearched(true);
    } catch (err) {
      console.error("search failed:", err);
      setWhitelistIds([]);
      setHasSearched(true);
    }
  }, [gameName, difficulty]);

  useEffect(() => {
    if (difficulty) {
      runSearch();
      return;
    }
    if (!gameName.trim()) {
      setWhitelistIds(null);
      setHasSearched(false);
    } else {
      runSearch();
    }
  }, [difficulty, gameName, runSearch]);

  return (
    <View style={styles.root}>
      <GardenBackgroundBlueSky style={styles.bg} />

      <View style={[styles.page, { flexDirection: isWide ? "row" : "column" }]}>
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
              {/* Fixed width container for search */}
              <View style={{ width: isWide ? 360 : 240, position: 'relative' }}>
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
                  onExpandChange={setSearchExpanded}
                />
              </View>

              {/* Word Bank button - gets smaller when search is expanded */}
              <TouchableOpacity
                style={[
                  ButtonStyles.wordBank.container,
                  searchExpanded && styles.wordBankCompact,
                  { 
                    flexDirection: "row", 
                    alignItems: "center",
                    justifyContent: "center",
                  },
                ]}
                onPress={() => setShowBook(true)}
              >
                <Book 
                  width={searchExpanded ? 50 : 50} 
                  height={searchExpanded ? 50 : 50} 
                />
                {!searchExpanded && (
                  <View style={{ flexDirection: "column", alignItems: "flex-start", paddingLeft: 8 }}>
                    <Text style={ButtonStyles.wordBank.text}>Word</Text>
                    <Text style={ButtonStyles.wordBank.text}>Bank</Text>
                  </View>
                )}
              </TouchableOpacity>

              <WordBankModal visible={showBook} onClose={() => setShowBook(false)} />
            </View>
          </View>

          {/* Main Area */}
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
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 8,
    minHeight: 60,
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
    alignItems: "flex-start",
    gap: 12,
  },
  publicGamesContainer: {
    flexDirection: "column",
    gap: 16,
    flex: 1,
    minHeight: 0,
    marginTop: 8,
  },
  wordBankCompact: {
    width: 70,
    height: 60,
    paddingHorizontal: 8,
  },
});