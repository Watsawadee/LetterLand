import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useUserProfile } from "@/hooks/useGetUserProfile";
import { View, Dimensions, Switch, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Pressable } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import LoadingPopup from "@/components/LoadingPopupCreateGame";

import {
  Text,
  Button,
  TextInput,
  Card,
  SegmentedButtons,
  IconButton,
  Portal,
  Dialog,
} from "react-native-paper";
import { useCreateGameFromGemini } from "@/hooks/useCreateGeminiGame";
import { CreateGameFromGeminiRequest } from "../../libs/type";
import GardenBackground from "@/assets/backgroundTheme/GardenBackground";
import GardenBackgroundBlueSky from "@/assets/backgroundTheme/GardenBackgroundBlue";
import PlainTextIcon from "@/assets/icon/plainText";
import LinkIcon from "@/assets/icon/linkIcon";
import PdfIcon from "@/assets/icon/pdfIcon";
import { Color } from "@/theme/Color";
import ArrowLeft from "@/assets/icon/ArrowLeft";
import ToggleButton from "react-native-paper";
import GlobeIcon from "@/assets/icon/Globe";
import LockKeyIcon from "@/assets/icon/LockKey";
import InfoIcon from "@/assets/icon/infoIcon";
import { Typography } from "@/theme/Font";
import GridIcon from "@/assets/icon/GridIcon";
import CloseIcon from "@/assets/icon/CloseIcon";
import UploadIcon from "@/assets/icon/UploadIcon";
import LoadingPopupCreateGame from "@/components/LoadingPopupCreateGame";


const CreateGameScreen = () => {
  const router = useRouter();
  const { gameType } = useLocalSearchParams<{
    gameType?: "WORD_SEARCH" | "CROSSWORD_SEARCH";
  }>();


  const [englishLevel, setEnglishLevel] = useState<CreateGameFromGeminiRequest["difficulty"]>();
  type UiTimer = "none" | "60" | "180" | "300";
  const TIMER_OPTIONS: UiTimer[] = ["none", "60", "180", "300"];

  type CEFR = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

  type LevelGroup = {
    id: string;
    title: string;          // "A1 - A2"
    levels: CEFR[];         // ["A1","A2"]
    grid: number;           // 8 | 10 | 12
    blurb: string;
  };

  const LEVEL_GROUPS: LevelGroup[] = [
    {
      id: "a",
      title: "A1 - A2",
      levels: ["A1", "A2"],
      grid: 8,
      blurb:
        "At these levels, you’ll encounter simple and easy words, ideal for everyday conversations and basic interactions. The grid size is ",
    },
    {
      id: "b",
      title: "B1 - B2",
      levels: ["B1", "B2"],
      grid: 10,
      blurb:
        "As you move to intermediate levels, the words become slightly more challenging, involving a wider range of topics and situations. The grid size grows to ",
    },
    {
      id: "c",
      title: "C1 - C2",
      levels: ["C1", "C2"],
      grid: 12,
      blurb:
        "At the advanced levels, the words are more complex and specialized, often used in academic, professional, or abstract contexts. The grid size is ",
    },
  ];

  const formatTimerLabel = (t: UiTimer) => {
    if (t === "none") return "None";
    const mins = Number(t) / 60;
    return `${mins} ${mins === 1 ? "min" : "mins"}`;
  };
  const [timer, setTimer] = useState<UiTimer>("none");
  const [uploadType, setUploadType] = useState<"text" | "link" | "pdf">("text");
  const [isPublic, setIsPublic] = useState(false)
  const [input, setInput] = useState("");
  const [pdfFile, setPdfFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [infoDialogVisible, setInfoDialogVisible] = useState(false);
  const [showLevelDialog, setShowLevelDialog] = useState(false);

  const handleUploadTypeSelect = async (type: "text" | "link" | "pdf") => {
    setUploadType(type)
    if (type !== "pdf") {
      setPdfFile(null);
      setInput("");
    }
  };
  const handlePdfPick = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (!result.canceled && result.assets?.length) {
      const file = result.assets[0];
      setPdfFile(file);
      setInput("");
    } else {
      alert("No PDF selected.");
    }
  };





  const handleToggle = () => {
    setIsPublic(previousState => !previousState);
  }

  const { data: user, isLoading, isError } = useUserProfile();
  const createGameMutation = useCreateGameFromGemini();

  useEffect(() => {
    if (user && !("error" in user) && "englishLevel" in user) {
      setEnglishLevel(user.englishLevel);
    }
  }, [user]);


  //Map CEFR level to its color
  const levelColors: Record<string, string> = {
    A1: Color.A1,
    A2: Color.A2,
    B1: Color.B1,
    B2: Color.B2,
    C1: Color.C1,
    C2: Color.C2,
  };

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

    createGameMutation.mutate({
      data: {
        userId: user.id,
        ownerId: user.id,
        difficulty: englishLevel,
        inputData: input,
        type: apiUploadType,
        gameType: gameType!,
        timer: apiTimer,
        isPublic
      },
      file: pdfFile
    },
      {
        onSuccess: (game) => {
          const id = String(game.id);
          router.replace({ pathname: "/GameScreen", params: { gameId: id } });
        },
      }
    );

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
              width: "100%",
              maxWidth: "100%",
              height: "100%"
            }}
          >
            <ScrollView
              contentContainerStyle={{
                padding: 16,
                paddingBottom: 120, // leave space for the footer button
              }}
              keyboardShouldPersistTaps="handled"
            >
              <View style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start", marginBottom: 20 }}>
                <Pressable
                  onPress={() => {
                    if (router.canGoBack?.()) {
                      router.back();
                    } else {
                      router.replace("/Home");
                    }
                  }}
                  hitSlop={10}
                >
                  <ArrowLeft color={Color.gray} />
                </Pressable>
                <Text variant="titleLarge" style={{ fontWeight: "800", color: Color.gray }}>
                  Create Puzzle
                </Text>
              </View>
              <View style={{ gap: 10 }}>
                <View style={{ display: "flex", flexDirection: "row", gap: 2, alignItems: "center" }}>
                  <Text style={{ fontWeight: "700", color: Color.gray }}>English Level</Text>
                  <IconButton
                    icon={(p) => <InfoIcon size={16} color={p.color ?? Color.gray} />}
                    size={16}
                    onPress={() => setInfoDialogVisible(true)}
                    iconColor={Color.gray}
                    containerColor="transparent"
                    style={{ margin: 0 }}
                    accessibilityLabel="English level info"
                  />
                  <Portal>
                    <Dialog visible={infoDialogVisible} onDismiss={() => setInfoDialogVisible(false)} style={{ backgroundColor: Color.lightblue, width: "50%", display: "flex", alignSelf: 'center' }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          paddingRight: 10,
                        }}
                      >
                        <Dialog.Title style={{ fontWeight: "800", color: Color.gray, marginRight: 8 }}>
                          English Level
                        </Dialog.Title>

                        <IconButton
                          icon={(p) => <CloseIcon width={18} height={18} fillColor={Color.gray} {...p} />}
                          onPress={() => setInfoDialogVisible(false)}
                          style={{ margin: 0 }}
                          accessibilityLabel="Close dialog"
                        />
                      </View>
                      <Dialog.Content>
                        <View
                          style={{
                            gap: 24,
                          }}
                        >
                          {LEVEL_GROUPS.map(({ id, title, blurb, grid, levels }) => {
                            const isUserGroup =
                              englishLevel && (levels as CEFR[]).includes(englishLevel as CEFR);

                            return (
                              <View
                                key={id}
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: 16,
                                }}
                              >
                                <View style={{ flex: 1, paddingRight: 8 }}>
                                  <Text
                                    style={{
                                      fontWeight: "900",
                                      fontSize: 18,
                                      color: Color.gray,
                                    }}
                                  >
                                    {title} {isUserGroup ? "(Your current level)" : ""}
                                  </Text>
                                  <Text style={{ color: Color.gray, marginTop: 6, lineHeight: 20, width: "80%" }}>
                                    {blurb}
                                    <Text style={{ color: Color.gray, fontWeight: Typography.header20.fontWeight }}>{`${grid}x${grid}`}</Text>
                                  </Text>
                                </View>

                                <View style={{ alignItems: "center" }}>
                                  <GridIcon grid={grid} width={84} height={84} />
                                  <Text style={{ marginTop: 8, fontWeight: "900", color: Color.gray }}>
                                    {`${grid}x${grid}`}
                                  </Text>
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      </Dialog.Content>
                    </Dialog>
                  </Portal >
                </View>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, height: "15%" }}>
                  {["A1", "A2", "B1", "B2", "C1", "C2"].map((level) => {
                    const isActive = englishLevel === level;
                    const isUsersLevel = user && !("error" in user) && user.englishLevel === level;
                    const levelOrder = ["A1", "A2", "B1", "B2", "C1", "C2"];
                    const userLevelIndex = user && !("error" in user) ? levelOrder.indexOf(user.englishLevel) : -1;
                    const thisLevelIndex = levelOrder.indexOf(level);
                    const isDisabled = thisLevelIndex > userLevelIndex;
                    return (
                      <View key={level} style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: 3 }}>
                        {isUsersLevel && (
                          <View style={{ padding: 4, borderRadius: 12, backgroundColor: isActive ? levelColors[level] : Color.white, display: "flex" }}>
                            <Text style={{ color: isActive ? Color.white : Color.gray, fontWeight: "700", fontSize: 10, textAlign: "center" }}>Your Level</Text>
                          </View>
                        )}
                        <Pressable
                          onPress={() => {
                            if (isDisabled) {
                              setShowLevelDialog(true);
                            } else {
                              setEnglishLevel(level as typeof englishLevel);
                            }
                          }}
                          style={{ width: "100%" }}
                        >
                          <Button
                            onPress={() => setEnglishLevel(level as typeof englishLevel)}
                            disabled={isDisabled}
                            style={{
                              marginBottom: 8,
                              borderRadius: 20,
                              borderColor: isActive ? levelColors[level] : "#ddd",
                              backgroundColor: isDisabled
                                ? "#ddd"
                                : isActive
                                  ? levelColors[level]
                                  : "#fff",
                            }}
                          >
                            <Text style={{ color: isDisabled ? Color.white : isActive ? Color.white : Color.gray, fontWeight: "bold" }}>
                              {level}
                            </Text>
                          </Button>
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
                <Portal>
                  <Dialog
                    visible={showLevelDialog}
                    onDismiss={() => setShowLevelDialog(false)}
                    style={{
                      backgroundColor: Color.white,
                      width: "50%", display: "flex", alignSelf: 'center'
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingRight: 10,
                      }}
                    >
                      <Dialog.Title style={{ color: Color.gray }}>Not allowed</Dialog.Title>
                      <IconButton
                        icon={(p) => <CloseIcon width={18} height={18} fillColor={Color.gray} {...p} />}
                        onPress={() => setShowLevelDialog(false)}
                        style={{ margin: 0 }}
                        accessibilityLabel="Close dialog"
                      />
                    </View>
                    <Dialog.Content>
                      <Text style={{ color: Color.gray }}>
                        You cannot select a game level higher than your current CEFR level.
                      </Text>
                    </Dialog.Content>
                  </Dialog>
                </Portal>
                <View style={{ flexDirection: "column", gap: 8 }}>
                  <Text style={{ fontWeight: "700", color: Color.gray }}>Timer</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {TIMER_OPTIONS.map((t) => {
                      const active = timer === t;
                      return (
                        <Button
                          key={t}
                          style={{
                            marginRight: 8,
                            marginBottom: 8,
                            borderRadius: 20,
                            backgroundColor: active ? "#58A7F8" : "#fff",
                            borderColor: "#ddd",
                          }}
                          onPress={() => setTimer(t)}
                        >
                          <Text
                            style={{
                              color: active ? Color.white : Color.gray,
                              fontWeight: "bold",
                            }}
                          >
                            {formatTimerLabel(t)}
                          </Text>
                        </Button>
                      );
                    })}
                  </View>
                </View>
                <View style={{ flexDirection: "column", gap: 8 }}>
                  <Text style={{ fontWeight: "700", color: Color.gray }}>Game Privacy</Text>
                  {/* <View style={{ flexDirection: "row", gap: 8 }}> */}
                  {/* <Button
                      style={{
                        borderRadius: 20,
                        backgroundColor: isPublic ? "#58A7F8" : "#fff",
                        borderColor: "#ddd",
                      }}
                      onPress={() => setIsPublic(true)}
                    >
                      <Text
                        style={{
                          color: isPublic ? Color.white : Color.gray,
                          fontWeight: "bold",
                        }}
                      >
                        Public Game
                      </Text>
                    </Button>

                    <Button
                      style={{
                        borderRadius: 20,
                        backgroundColor: !isPublic ? "#58A7F8" : "#fff",
                        borderColor: "#ddd",
                      }}
                      onPress={() => setIsPublic(false)}
                    >
                      <Text
                        style={{
                          color: !isPublic ? Color.white : Color.gray,
                          fontWeight: "bold",
                        }}
                      >
                        Private Game
                      </Text>
                    </Button> */}
                  {/* <SegmentedButtons value={isPublic ? "public" : "private"}
                      onValueChange={(v) => setIsPublic(v === "public")}
                      buttons={[{ value: "public", label: "Public", icon: (p) => <GlobeIcon {...p} fillColor={isPublic ? Color.white : Color.blue} />, labelStyle: { color: isPublic ? Color.white : Color.gray }, }, { value: "private", label: "Private", icon: (p) => <LockKeyIcon {...p} fillColor={isPublic ? Color.blue : Color.white} />, labelStyle: { color: isPublic ? Color.gray : Color.white } }]}
                      style={{ width: "50%" }}
                      theme={{
                        roundness: 200,
                        colors: {
                          secondaryContainer: Color.blue,
                          surface: "#FFFFFF",
                          onSurface: Color.gray,
                          outline: "#E6E8EF",
                        },
                      }}
                    /> */}
                  <View
                    accessible
                    accessibilityRole="radiogroup"
                    accessibilityLabel="Game visibility"
                    style={{ flexDirection: "row", gap: 8 }}
                  >
                    {(["public", "private"] as const).map((v) => {
                      const selected = (isPublic ? "public" : "private") === v;
                      const title = v === "public" ? "Public" : "Private";
                      const subtitle = v === "public" ? "Anyone can see and play" : "Invite only with code";

                      return (
                        <Pressable
                          key={v}
                          onPress={() => setIsPublic(v === "public")}
                          accessibilityRole="radio"
                          accessibilityState={{ selected }}
                          accessibilityLabel={title}
                          accessibilityHint="Double tap to select"
                          style={{
                            flex: 1,
                            borderRadius: 16,
                            paddingVertical: 10,
                            paddingHorizontal: 14,
                            backgroundColor: selected ? Color.blue : "#fff",
                            borderWidth: selected ? 0 : 1,
                            borderColor: "#E6E8EF",
                          }}
                        >
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                            {v === "public"
                              ? <GlobeIcon width={18} height={18} fillColor={selected ? "#fff" : Color.blue} />
                              : <LockKeyIcon width={18} height={18} fillColor={selected ? "#fff" : Color.blue} />
                            }
                            <View style={{ flexShrink: 1 }}>
                              <Text style={{ fontWeight: "800", color: selected ? "#fff" : Color.gray }}>{title}</Text>
                              <Text style={{ fontSize: 12, color: selected ? "#fff" : Color.gray }}>
                                {subtitle}
                              </Text>
                            </View>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                  {/* </View> */}
                </View>

                <View style={{ flexDirection: "column", gap: 8 }}>
                  <Text style={{ fontWeight: "700", color: Color.gray }}>
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
                              fill={isActive ? Color.white : Color.gray}
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
                          labelStyle={{ fontWeight: "bold", color: isActive ? Color.white : Color.gray }}
                        >
                          {label}
                        </Button>

                      );
                    })}
                  </View>
                  {uploadType === "pdf" ? (
                    <Pressable
                      onPress={handlePdfPick}
                      style={{
                        height: 150,
                        borderRadius: 16,
                        borderColor: Color.gray,
                        backgroundColor: "#FFF",
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: 10,
                        marginBottom: 12,
                      }}
                    >
                      {pdfFile ? (
                        <Text
                          style={{
                            color: Color.gray,
                            fontWeight: "600",
                            textAlign: "center",
                          }}
                        >
                          {pdfFile.name}
                        </Text>
                      ) : (
                        <>
                          <UploadIcon size={40} color={Color.gray} />
                          <Text
                            style={{
                              marginTop: 8,
                              color: Color.gray,
                              fontWeight: "600",
                            }}
                          >
                            Tap to upload PDF
                          </Text>
                        </>
                      )}
                    </Pressable>
                  ) : (
                    <TextInput
                      placeholder={uploadType === "link" ? "Paste a link..." : "Input text..."}
                      multiline
                      style={{
                        marginBottom: 12,
                        backgroundColor: "#FFF",
                        borderRadius: 20,
                        marginTop: 10,
                        minHeight: 125,
                      }}
                      value={input}
                      onChangeText={setInput}
                      mode="outlined"
                      outlineColor="#5B6073"
                      autoCapitalize="none"
                      textColor="black"
                      activeOutlineColor={Color.blue}
                    />
                  )}


                </View>
              </View>


              <Button
                mode="contained"
                onPress={handleCreate}
                loading={createGameMutation.status === "pending"}
                disabled={createGameMutation.status === "pending"}
                style={{
                  backgroundColor: Color.blue,
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
            <LoadingPopupCreateGame
              visible={isCreating}  // enables the PDF-specific joke
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
