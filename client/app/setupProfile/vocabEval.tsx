import { useEffect, useState } from "react";
import { View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getWords, setupProfile } from "../../services/setupUser";
import { ActivityIndicator, Button, Card, IconButton, Text } from "react-native-paper";
import { getLoggedInUserId } from "@/utils/auth";
import GardenBackground from "@/assets/backgroundTheme/GardenBackground";
import { Color } from "@/theme/Color";
import UserLevelModal from "@/components/UserLevelModal";
import { CEFRLevel } from "@/theme/CEFR";

const VocabEvalScreen = () => {
  const { age } = useLocalSearchParams<{
    age: string;
  }>();
  const [userId, setUserId] = useState<string | null>(null);
  const [headwords, setHeadwords] = useState<string[]>([]);
  const [selectedHeadwords, setSelectedHeadwords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [cefrLevel, setCefrLevel] = useState<CEFRLevel | null>(null);
  const [levelModalVisible, setLevelModalVisible] = useState(false);
  const [showLoadingMoreWord, setShowLoadingMoreWord] = useState(false);
  const MIN_WORDS = 5;
  const MAX_WORDS = 50;
  const LOAD_CHUNK = 20;

  useEffect(() => {
    const init = async () => {
      const id = await getLoggedInUserId();
      if (!id) {
        alert("Session expired. Please log in again.");
        router.replace("/authentication/login");
        return;
      }

      setUserId(id);

      try {
        const data = await getWords();

        if ("error" in data) {
          setHeadwords([]);
          alert("Failed to load words.");
        } else {
          setHeadwords(data.headwords.slice(0, 30));
        }
      } catch (error) {
        console.error("Failed to load words", error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleWordToggle = (word: string) => {
    setSelectedHeadwords((prev) => {
      if (prev.includes(word)) return prev.filter((w) => w !== word);
      if (prev.length >= MAX_WORDS) {
        alert(`You can select up to ${MAX_WORDS} words.`);
        return prev;
      }
      return [...prev, word];
    });
  };
  const toggleSelectAll = () => {
    const maxAvailable = Math.min(headwords.length, MAX_WORDS);
    if (maxAvailable === 0) return;
    const firstChunk = headwords.slice(0, maxAvailable);
    const allSelected = firstChunk.every((w) => selectedHeadwords.includes(w));
    if (allSelected) {

      setSelectedHeadwords([]);
      return;
    }

    setSelectedHeadwords(firstChunk);
  };

  const handleLoadMoreWords = async () => {
    if (headwords.length >= MAX_WORDS) return;
    setShowLoadingMoreWord(true);
    try {
      const data = await getWords();
      if ("error" in data) {
        alert("Failed to load more words.");
        return;
      }

      setHeadwords((prev) => {
        const unseen = data.headwords.filter((w) => !prev.includes(w));
        if (unseen.length === 0) {
          return prev;
        }
        const spaceLeft = Math.max(0, MAX_WORDS - prev.length);
        const toAdd = unseen.slice(0, Math.min(spaceLeft, LOAD_CHUNK));
        return [...prev, ...toAdd];
      });
    } catch (error) {
      alert("Failed to load more words");
    } finally {
      setShowLoadingMoreWord(false);
    }
  }

  const handleSubmit = async () => {
    if (!userId || !age) {
      alert("Missing userId or age");
      return;
    }
    console.log("VocabEvalScreen - Submitting profile setup with:", {
      userId,
      age,
      selectedHeadwords,
    });
    try {
      const res = await setupProfile({
        userId: Number(userId),
        age: Number(age),
        selectedHeadwords,
      });

      if ("error" in res) {
        return;
      }
      if (res.message === "Setup completed") {
        setCefrLevel(res.cefrLevel);
        setLevelModalVisible(true);
        return;
      }
    } catch (error) {
      console.error(error);
      alert("Failed to setup profile.");
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const maxAvailable = Math.min(headwords.length, MAX_WORDS);
  const firstChunk = headwords.slice(0, maxAvailable);
  const allSelected = firstChunk.length > 0 && firstChunk.every((w) => selectedHeadwords.includes(w));

  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        backgroundColor: "#F2F8F9",
      }}
    >
      <GardenBackground
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: 1000,
          zIndex: 0,
        }}
      />
      <View style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>

        <Card
          mode="contained"
          style={{
            padding: 24,
            width: "100%",
            minWidth: "80%",
            borderRadius: 16,
            gap: 16,
            backgroundColor: "transparent",

          }}
        >
          <View style={{ display: "flex", flexDirection: "column", width: "100%", justifyContent: "center" }}>
            <Text
              variant="titleLarge"
              style={{
                textAlign: "center",
                fontWeight: "800",
                color: "#5B6073",
              }}
            >
              What words are you familiar with?
            </Text>
            <View style={{ width: "67%", maxHeight: "15%", flexDirection: "row", alignSelf: "flex-end", alignItems: "center", justifyContent: "space-around", marginBottom: "1%" }}>
              <Text style={{ color: "#6B7280", fontSize: 13, fontWeight: "600", textAlignVertical: "center" }}>
                Select at least {MIN_WORDS} to continue
              </Text>

              <Button
                icon={allSelected ? "close-circle-outline" : "check-circle-outline"}
                mode="outlined"
                onPress={toggleSelectAll}
                disabled={headwords.length === 0}
                style={{ borderRadius: 10, borderColor: Color.blue, width: "20%" }}
                labelStyle={{ color: "#58A7F8", fontWeight: "700" }}
                rippleColor={"transparent"}
              >
                {(() => {
                  const maxAvailable = Math.min(headwords.length, MAX_WORDS);
                  const firstChunk = headwords.slice(0, maxAvailable);
                  const allSelected = firstChunk.length > 0 && firstChunk.every((w) => selectedHeadwords.includes(w));
                  return allSelected ? "Clear" : `Select all (${maxAvailable})`;
                })()}
              </Button>

            </View>
            <View style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 8,
            }}>
              {headwords.map((word, index) => (
                <Button
                  key={index}
                  style={{
                    margin: 4,
                    backgroundColor: selectedHeadwords.includes(word) ? "#58A7F8" : "white",
                    borderColor: "#58A7F8",
                    borderRadius: 12,
                  }}
                  labelStyle={{
                    color: selectedHeadwords.includes(word) ? "white" : "#58A7F8",
                    fontWeight: "600",
                  }}
                  onPress={() => handleWordToggle(word)}
                >
                  {word}
                </Button>
              ))}
            </View>

            {selectedHeadwords.length >= 10 && headwords.length < MAX_WORDS && (
              <Button
                mode="outlined"
                onPress={handleLoadMoreWords}
                loading={showLoadingMoreWord}
                disabled={selectedHeadwords.length < 10}
                style={{
                  borderRadius: 10,
                  marginTop: 16,
                  alignSelf: "center",
                  borderColor: "#58A7F8",
                }}
                labelStyle={{
                  color: "#58A7F8",
                  fontWeight: "700",
                }}
              >
                See More Words
              </Button>
            )}
            <Button
              mode="contained"
              onPress={handleSubmit}
              disabled={selectedHeadwords.length < MIN_WORDS}
              style={{
                backgroundColor:
                  selectedHeadwords.length < MIN_WORDS ? "#AEAEAE" : "#58A7F8",
                borderRadius: 10,
                marginTop: 20,
                alignSelf: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "800", fontSize: 16 }}>
                Continue
              </Text>
            </Button>
          </View>
        </Card>
      </View >
      {cefrLevel && (
        <UserLevelModal
          visible={levelModalVisible}
          level={cefrLevel}
          onConfirm={() => setLevelModalVisible(false)}
          onRequestClose={() => setLevelModalVisible(false)}
        />
      )}
    </View >
  );
};

export default VocabEvalScreen;
