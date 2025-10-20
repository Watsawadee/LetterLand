import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Image,
  AppState,
  AppStateStatus,
} from "react-native";
import GardenBackgroundBlueSky from "@/assets/backgroundTheme/GardenBackgroundBlue";
import WordBankModal from "@/components/WordBank";
import { ButtonStyles } from "@/theme/ButtonStyles";
import { Typography } from "@/theme/Font";
import MyGamesRow from "@/components/mygame";
import UserOverviewCard from "@/components/UserOverViewCard";
import mascot from "@/assets/images/mascot.png";
import Book from "@/assets/icon/Book";
import AchievementsRow from "../../components/AchievementRow";
import { fetchUserCoins } from "@/services/achievementService";
import { useUserProfile } from "@/hooks/useGetUserProfile";
import { getDecodedToken } from "@/utils/auth";
import UserSettingCard from "@/components/UserSettingCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserLastFinishedGame } from "@/hooks/useGetUserLastFinishedGame";
import { formatDistanceToNow } from "date-fns";

export default function Home() {
  const router = useRouter();
  const [showBook, setShowBook] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [greeting, setGreeting] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);
  const [coins, setCoins] = useState(0);

  const { width } = useWindowDimensions();
  const isWide = width >= 1024;

  const {
    data: profile,
    isLoading,
    error,
    refetch: refetchProfile,
  } = useUserProfile();

  const { data: lastFinishedGame } = useUserLastFinishedGame();

  const capitalizeWords = (s: string) =>
    s.replace(/\b\w/g, (c) => c.toUpperCase());

  const displayName =
    (profile && !("error" in profile) && profile.username) || username || "";

  useEffect(() => {
    const loadCoins = async () => {
      try {
        const balance = await fetchUserCoins();
        setCoins(balance);
      } catch (e) {
        console.error("Failed to load coins:", e);
      }
    };
    loadCoins();
  }, []);

  useEffect(() => {
    const fetchUsername = async () => {
      const decoded = await getDecodedToken();
      setUsername(decoded?.username ?? null);
    };
    fetchUsername();
  }, []);

  useEffect(() => {
    const checkLastVisit = async () => {
      try {
        const decoded = await getDecodedToken();
        const userId = decoded?.userId;
        const userName = displayName || decoded?.username;
        if (!userId || !userName) return;

        const now = new Date();
        const key = `lastVisit_${userId}`;
        const lastVisitStr = await AsyncStorage.getItem(key);

        const hour = now.getHours();
        const timeGreeting =
          hour < 12
            ? `Good morning 🌞 ${userName}!`
            : hour < 18
            ? `Good afternoon 🌤️ ${userName}!`
            : `Good evening 🌙 ${userName}!`;

        let visitMsg = "";
        if (lastVisitStr) {
          const lastVisit = new Date(lastVisitStr);
          const diffDays =
            (now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24);
          if (diffDays >= 2) {
            visitMsg = `Long time no see, ${userName}! You haven’t entered the app for ${Math.floor(
              diffDays
            )} days 👀`;
          } else if (diffDays >= 1) {
            visitMsg = `Welcome back, ${userName}! It’s been a day`;
          } else {
            visitMsg = `Welcome, ${userName}! Great to see you again today`;
          }
        } else {
          visitMsg = `Hi ${userName}! Nice to meet you for the first time`;
        }

        let gameMsg =
          "You haven’t finished any games yet — let’s start one today!";
        if (
          lastFinishedGame &&
          lastFinishedGame.finishedAt &&
          !isNaN(new Date(lastFinishedGame.finishedAt).getTime())
        ) {
          gameMsg = `Your last puzzle was "${
            lastFinishedGame.topic
          }" — finished ${formatDistanceToNow(
            new Date(lastFinishedGame.finishedAt),
            { addSuffix: true }
          )}`;
        }

        let coinMsg = "";
        if (profile && !("error" in profile)) {
          coinMsg = `You’ve got ${profile.coin} coins`;
        }

        const messages = [timeGreeting, visitMsg, gameMsg, coinMsg];
        const randomMessage =
          messages[Math.floor(Math.random() * messages.length)];

        setGreeting(randomMessage);
        await AsyncStorage.setItem(key, now.toISOString());
      } catch (err) {
        console.error("Error tracking last visit:", err);
      }
    };

    checkLastVisit();
  }, [lastFinishedGame, profile, displayName]);

  useEffect(() => {
    if (profile && !("error" in profile)) {
      const nameFromProfile = profile.username || profile.username;
      if (nameFromProfile && nameFromProfile !== username) {
        setUsername(nameFromProfile);
      }
    }
  }, [profile]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (state === "active") {
        refetchProfile?.();
      }
    });
    return () => sub.remove();
  }, [refetchProfile]);

  if (isLoading) return <Text>Loading...</Text>;
  if (error || !profile) return <Text>Error loading user profile</Text>;
  if ("error" in profile) return <Text>Failed to load user profile</Text>;

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
          <View style={styles.headerRow}>
            <View style={styles.greetingContainer}>
              <Image
                source={mascot}
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 25,
                  transform: [{ scaleX: -1 }],
                }}
                resizeMode="contain"
              />
              <View style={{ flex: 1 }}>
                <Text style={[Typography.header25, { marginBottom: 4 }]}>
                  Hello {displayName ? capitalizeWords(displayName) : ""}
                </Text>
                <Text
                  style={[
                    Typography.body20,
                    { opacity: 0.8, flexShrink: 1, flexWrap: "wrap" },
                  ]}
                >
                  {greeting}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                ButtonStyles.wordBank.container,
                {
                  flexDirection: "row",
                  alignItems: "center",
                  alignSelf: "flex-start",
                  marginLeft: 16,
                },
              ]}
              onPress={() => setShowBook(true)}
            >
              <Book width={50} height={50} style={{ marginRight: 4 }} />
              <View
                style={{
                  flexDirection: "column",
                  alignItems: "flex-start",
                  paddingLeft: 8,
                }}
              >
                <Text style={ButtonStyles.wordBank.text}>Word</Text>
                <Text style={ButtonStyles.wordBank.text}>Bank</Text>
              </View>
            </TouchableOpacity>

            <WordBankModal
              visible={showBook}
              onClose={() => setShowBook(false)}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={Typography.header25}>Achievements</Text>
              <TouchableOpacity
                onPress={() => router.push("/Achievementboard")}
              >
                <Text style={[Typography.header13, styles.link]}>view all</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.sectionContent}>
              <AchievementsRow
                onCoinsUpdated={(newBalance) => setCoins(newBalance)}
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={Typography.header25}>Recent game</Text>
              <TouchableOpacity onPress={() => router.push("/Myboard")}>
                <Text style={[Typography.header13, styles.link]}>view all</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.sectionContent}>
              <MyGamesRow title=" " scrollDirection="horizontal" />
            </View>
          </View>
        </View>

        <View
          style={{
            flex: 1.55,
            borderRadius: 20,
            padding: 6,
            paddingTop: 15,
            paddingBottom: 15,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {showSettings ? (
            <UserSettingCard
              onBack={() => {
                setShowSettings(false);
                refetchProfile?.();
              }}
            />
          ) : (
            <UserOverviewCard
              coins={coins}
              onOpenSettings={() => setShowSettings(true)}
            />
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
    paddingHorizontal: 0,
    paddingTop: 16,
    paddingBottom: 24,
    flexDirection: "row",
  },
  leftPanel: {
    flex: 3,
    borderRadius: 20,
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 35,
  },
  section: {
    marginBottom: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  sectionContent: {},
  link: {
    color: "#2F80ED",
  },
  greetingContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
});