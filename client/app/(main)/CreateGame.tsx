import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useUserProfile } from "@/hooks/useGetUserProfile";
import { View, Dimensions, Switch, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import LoadingPopup from "@/components/LoadingPopupCreateGame";

import {
  Text,
  Button,
  TextInput,
  Card,
} from "react-native-paper";
import { theme } from "@/theme";
import { useCreateGameFromGemini } from "@/hooks/useCreateGeminiGame";
import { CreateGameFromGeminiRequest } from "../../libs/type";
import GardenBackground from "@/assets/backgroundTheme/GardenBackground";
import GardenBackgroundBlueSky from "@/assets/backgroundTheme/GardenBackgroundBlue";
import PlainTextIcon from "@/assets/icon/plainText";
import LinkIcon from "@/assets/icon/linkIcon";
import PdfIcon from "@/assets/icon/pdfIcon";

const CreateGameScreen = () => {
  const router = useRouter();
  const { gameType } = useLocalSearchParams<{
    gameType?: "WORD_SEARCH" | "CROSSWORD_SEARCH";
  }>();


  const [englishLevel, setEnglishLevel] = useState<CreateGameFromGeminiRequest["difficulty"]>();
  type UiTimer = "none" | "1" | "3" | "5";
  const [timer, setTimer] = useState<UiTimer>("none");
  const [uploadType, setUploadType] = useState<"text" | "link" | "pdf">("text");
  const [isPublic, setIsPublic] = useState(false)
  const [input, setInput] = useState("");
  const [pdfFile, setPdfFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const handleUploadTypeSelect = async (type: "text" | "link" | "pdf") => {
    if (type === "pdf") {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets?.length) {
        const file = result.assets[0];
        setPdfFile(file);
        setInput("");
        setUploadType("pdf");
      } else {
        alert("No PDF selected.");
      }
    } else {
      setUploadType(type);
      setPdfFile(null);
    }
  };


  const handleToggle = () => {
    setIsPublic(previousState => !previousState);
  }

  const { data: user, isLoading, isError } = useUserProfile();
  const createGameMutation = useCreateGameFromGemini();

  useEffect(() => {
    if (user && "englishLevel" in user) {
      setEnglishLevel(user.englishLevel);
    }

  }, [user]);

  const isCreating =
    (createGameMutation as any).isPending ??
    (createGameMutation.status === "pending");

  const handleCreate = async () => {
    if (!user || !("id" in user) || !englishLevel || !gameType) {
      alert("Please fill in all fields");
      return;
    }
    if ((uploadType === "text" || uploadType === "link") && !input.trim()) {
      alert(`Please provide a valid ${uploadType}.`);
      return;
    }
    if (uploadType === "pdf" && !pdfFile) {
      alert("Please upload a PDF file.");
      return;
    }
    const apiUploadType = uploadType === "pdf" ? "pdf" : uploadType;
    const apiTimer: number | null = timer === "none" ? null : Number(timer);
    console.log("🧠 Payload:", {
      userId: user.id,
      difficulty: englishLevel,
      inputData: input,
      type: uploadType,
      gameType,
      timer: apiTimer,
      isPublic
    });
    console.log("🧾 File:", pdfFile);
    createGameMutation.mutate({
      data: {
        userId: user.id,
        difficulty: englishLevel,
        inputData: input,
        type: apiUploadType,
        gameType: gameType!,
        timer: apiTimer,
        isPublic
      },
      file: pdfFile
    });
  };

  if (isError) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ color: "red" }}>❌ Failed to fetch user level. Please try again.</Text>
      </View>
    );
  }


  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
      }}
    >
      <GardenBackgroundBlueSky
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
      <SafeAreaView style={{ flex: 1, backgroundColor: "transparent", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.select({ ios: "padding", android: undefined })}
          keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
        >

          <Card
            style={{
              padding: 24,
              borderRadius: 16,
              gap: 16,
              backgroundColor: "#F2F8F9",
              width: "80%"
            }}
          >
            <ScrollView
              contentContainerStyle={{
                padding: 16,
                paddingBottom: 120, // leave space for the footer button
              }}
              keyboardShouldPersistTaps="handled"
            >
              <Text variant="titleLarge" style={{ fontWeight: "800", color: "#333" }}>
                Create Puzzle
              </Text>
              <View style={{ gap: 8 }}>
                <Text style={{ fontWeight: "700", color: "#555" }}>English Level</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {["A1", "A2", "B1", "B2", "C1", "C2"].map((level) => (
                    <Button
                      key={level}
                      onPress={() => setEnglishLevel(level as typeof englishLevel)}
                      style={{
                        marginRight: 8,
                        marginBottom: 8,
                        borderRadius: 20,
                        borderColor: englishLevel === level ? "#EF476F" : "#ddd",
                        backgroundColor: englishLevel === level ? "#EF476F" : "#fff",
                      }}
                    >
                      <Text style={{ color: englishLevel === level ? theme.colors.white : theme.colors.darkGrey, fontWeight: "bold" }}>
                        {level}
                      </Text>
                    </Button>
                  ))}
                </View>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {(["none", "1", "3", "5"] as UiTimer[]).map((t) => (
                    <Button
                      key={t}
                      style={{
                        marginRight: 8,
                        marginBottom: 8,
                        borderRadius: 20,
                        backgroundColor: timer === t ? "#58A7F8" : "#fff",
                        borderColor: "#ddd",
                      }}
                      onPress={() => setTimer(t)}
                    >
                      <Text
                        style={{
                          color: timer === t ? theme.colors.white : theme.colors.darkGrey,
                          fontWeight: "bold",
                        }}
                      >
                        {t === "none" ? "None" : `${t} mins`}
                      </Text>
                    </Button>
                  ))}
                </View>
                <View style={{ flexDirection: "column", gap: 8 }}>
                  <Text style={{ fontWeight: "700", color: "#555" }}>Privacy</Text>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {["Public Game", "Private Game"].map((label) => {
                      const value = label === "Private Game";
                      return (
                        <Button
                          key={label}
                          style={{
                            marginRight: 8,
                            marginBottom: 8,
                            borderRadius: 20,
                            backgroundColor: isPublic === value ? "#58A7F8" : "#fff",
                            borderColor: "#ddd",
                          }}
                          onPress={() => setIsPublic(value)}
                        >
                          <Text
                            style={{
                              color: isPublic === value ? theme.colors.white : theme.colors.darkGrey,
                              fontWeight: "bold",
                            }}
                          >
                            {label}
                          </Text>
                        </Button>
                      );
                    })}
                  </View>
                </View>

                <Text style={{ fontWeight: "700", color: "#555" }}>
                  Upload type
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {[
                    { key: "text" as const, label: "Text", Icon: PlainTextIcon },
                    { key: "link" as const, label: "Link", Icon: LinkIcon },
                    { key: "pdf" as const, label: "PDF", Icon: PdfIcon },
                  ].map(({ key, label, Icon }) => {
                    const isActive = uploadType === key;

                    return (
                      <Button
                        key={key}
                        icon={() => (
                          <Icon
                            size={20}
                            fill={isActive ? theme.colors.white : theme.colors.darkGrey}
                          />
                        )}
                        style={{
                          marginRight: 8,
                          marginBottom: 8,
                          borderRadius: 20,
                          backgroundColor: isActive ? "#58A7F8" : "#fff",
                          borderColor: "#ddd",
                        }}
                        onPress={() => handleUploadTypeSelect(key)}
                        contentStyle={{ flexDirection: "row-reverse" }} // icon on left, label after (optional)
                        labelStyle={{ fontWeight: "bold", color: isActive ? theme.colors.white : theme.colors.darkGrey }}
                      >
                        {label}
                      </Button>
                    );
                  })}
                </View>
              </View>

              <TextInput
                placeholder="Input text..."
                multiline
                style={{
                  marginBottom: 12,
                  backgroundColor: "#FFF",
                  borderRadius: 12,
                  marginTop: 16,
                }}
                value={input}
                onChangeText={setInput}
                editable={uploadType !== "pdf"}
                mode="outlined"
                autoCapitalize="none"
                textColor="black"
                activeOutlineColor="#5B6073"
              />
              <Button
                mode="contained"
                onPress={handleCreate}
                loading={createGameMutation.status === "pending"}
                disabled={createGameMutation.status === "pending"}
                style={{
                  backgroundColor: "#007AFF",
                  borderRadius: 20,
                  alignSelf: "center",
                  marginTop: 16,
                  width: "50%"
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  Create
                </Text>
              </Button>

            </ScrollView>

            {/* Create Button */}
            <LoadingPopup
              visible={isCreating}
              uploadType={uploadType}     // enables the PDF-specific joke
            // progress={null}          // omit or pass a 0..1 when you implement real progress
            // lockBackButton={true}    // default true; set false if you want back button to close it
            />
          </Card>
        </KeyboardAvoidingView>
      </SafeAreaView >
    </View >
  );
};

export default CreateGameScreen;
