import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useUserProfile } from "@/hooks/useGetUserProfile";
import { View, Platform, ScrollView, Pressable, Modal, KeyboardAvoidingView } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import {
  Text,
  Button,
  TextInput,
  IconButton,
  Portal,
  Dialog,
} from "react-native-paper";
import { useCreateGameFromGemini } from "@/hooks/useCreateGeminiGame";
import { CreateGameFromGeminiRequest } from "../libs/type";
import GardenBackgroundBlueSky from "@/assets/backgroundTheme/GardenBackgroundBlue";
import PlainTextIcon from "@/assets/icon/plainText";
import LinkIcon from "@/assets/icon/linkIcon";
import PdfIcon from "@/assets/icon/pdfIcon";
import { Color } from "@/theme/Color";
import ArrowLeft from "@/assets/icon/ArrowLeft";
import GlobeIcon from "@/assets/icon/Globe";
import LockKeyIcon from "@/assets/icon/LockKey";
import InfoIcon from "@/assets/icon/infoIcon";
import { Typography } from "@/theme/Font";
import GridIcon from "@/assets/icon/GridIcon";
import CloseIcon from "@/assets/icon/CloseIcon";
import UploadIcon from "@/assets/icon/UploadIcon";
import LoadingPopupCreateGame from "@/components/LoadingPopupCreateGame";

type Props = {
  visible: boolean;
  onClose: () => void;
  gameType?: "WORD_SEARCH" | "CROSSWORD_SEARCH";
};

const CreateGameModal = ({ visible, onClose, gameType }: Props) => {
  const router = useRouter();

  const [englishLevel, setEnglishLevel] = useState<CreateGameFromGeminiRequest["difficulty"]>();
  type UiTimer = "none" | "300" | "420" | "540";
  const TIMER_OPTIONS: UiTimer[] = ["none", "300", "420", "540"];

  type CEFR = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

  type LevelGroup = {
    id: string;
    title: string;
    levels: CEFR[];
    grid: number;
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
    if (t === "300") return "5 min";
    if (t === "420") return "7 min";
    if (t === "540") return "9 min";
    return `${Number(t) / 60} min`;
  };
  const [timer, setTimer] = useState<UiTimer>("none");
  const [uploadType, setUploadType] = useState<"text" | "link" | "pdf">("text");
  const [isPublic, setIsPublic] = useState(false);
  const [input, setInput] = useState("");
  const [pdfFile, setPdfFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [infoDialogVisible, setInfoDialogVisible] = useState(false);
  const [showLevelDialog, setShowLevelDialog] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  // ...existing code...
  const [suspendParent, setSuspendParent] = useState(false);
  const [createdGameId, setCreatedGameId] = useState<string | null>(null);

  useEffect(() => {
    setSuspendParent(infoDialogVisible);
  }, [infoDialogVisible]);
  // ...existing code...

  const handleUploadTypeSelect = async (type: "text" | "link" | "pdf") => {
    setUploadType(type);
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

  const { data: user, isLoading, isError } = useUserProfile();
  const createGameMutation = useCreateGameFromGemini();

  useEffect(() => {
    if (user && !("error" in user) && "englishLevel" in user) {
      setEnglishLevel(user.englishLevel);
    }
  }, [user]);

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
    setIsCreatingGame(true);
    onClose();
    try {
      const game = await createGameMutation.mutateAsync(
        {
          data: {
            userId: user.id,
            ownerId: user.id,
            difficulty: englishLevel,
            inputData: input,
            type: apiUploadType,
            gameType: gameType!,
            timer: apiTimer,
            isPublic,
          },
          file: pdfFile,
        });
      setIsCreatingGame(false);
      setCreatedGameId(String(game.id));
      setSuccessModalVisible(true);
    } catch (err: any) {
      setIsCreatingGame(false);
      alert("Failed to create game: " + (err?.message || err));
    }
  };

  if (isError) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ color: "red" }}>❌ Failed to fetch user level. Please try again.</Text>
      </View>
    );
  }
  return (
    <>
      <Portal>
        <Dialog
          visible={successModalVisible}
          onDismiss={() => setSuccessModalVisible(false)}
          style={{ backgroundColor: Color.white, width: "30%", alignSelf: "center", height: "25%", padding: 5, zIndex: 200 }}
        >
          <Dialog.Title style={{ color: Color.blue, textAlign: "center" }}>Game created successfully!</Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: Color.blue, textAlign: "center" }}>Your game has been created.</Text>
          </Dialog.Content>
          <Button
            mode="contained"
            onPress={() => {
              setSuccessModalVisible(false);
              if (createdGameId) {
                router.replace({
                  pathname: "/GameScreen",
                  params: { gameId: createdGameId },
                });
                setCreatedGameId(null);
              } else {
                alert("Game created but id not available.");
              }
            }}
            style={{
              backgroundColor: Color.blue,
              borderRadius: 10,
              marginTop: 8,
              width: "30%",
              alignSelf: "center"
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>OK</Text>
          </Button>
        </Dialog >
      </Portal >
      {infoDialogVisible && (
        <Modal
          visible={infoDialogVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setInfoDialogVisible(false)}
        >
          <Pressable
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => { setInfoDialogVisible(false) }}
          >
            <Pressable
              style={{
                backgroundColor: Color.lightblue,
                borderRadius: 16,
                padding: 24,
                width: "90%",
                maxWidth: 400,
                elevation: 8,
              }}
              onPress={(e) => e.stopPropagation()}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingRight: 10,
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontWeight: "800", color: Color.gray, fontSize: 20, marginRight: 8 }}>
                  English Level
                </Text>
                <IconButton
                  icon={(p) => <CloseIcon width={18} height={18} fillColor={Color.gray} {...p} />}
                  onPress={() => setInfoDialogVisible(false)}
                  style={{ margin: 0 }}
                  accessibilityLabel="Close dialog"
                />
              </View>
              <View style={{ gap: 24 }}>
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
            </Pressable>
          </Pressable>
        </Modal>
      )
      }
      {
        !suspendParent && (
          <Modal
            visible={visible}
            animationType="fade"
            transparent
            onRequestClose={onClose}
          >
            <Pressable
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={onClose}
            >
              <Pressable
                style={{
                  width: "50%",
                  height: "90%",
                  borderRadius: 24,
                  backgroundColor: "#F2F8F9",
                  overflow: "hidden",
                  elevation: 10,
                  shadowColor: "#000",
                  shadowOpacity: 0.25,
                  shadowOffset: { width: 0, height: 2 },
                  shadowRadius: 8,
                  position: "relative",
                  padding: 24,
              
                 
                }}
                onPress={(e) => e.stopPropagation()}
              >
                <View style={{ flex: 1, zIndex: 1 }}>
                  <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.select({ ios: "padding", android: undefined })}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
                  >
                    <ScrollView
                      contentContainerStyle={{
                        padding: 16,
                        paddingBottom: 120,
                      }}
                      keyboardShouldPersistTaps="handled"
                    >
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <View style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start", marginBottom: 20 }}>
                          {/* <Pressable
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
                          </Pressable> */}
                          <Text variant="titleLarge" style={{  color: Color.gray, fontWeight: Typography.popupheader.fontWeight }}>
                            Create Puzzle
                          </Text>
                        </View>
                        <IconButton
                          icon={(p) => <CloseIcon width={18} height={18} fillColor={Color.gray} {...p} />}
                          onPress={onClose}
                          style={{ margin: 0 }}
                          accessibilityLabel="Close dialog"
                        />
                      </View>
                      <View >
                        <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
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

                        </View>
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, height: "15%" }}>
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
                                      marginBottom: 12,
                                      borderRadius: 20,
                                      elevation: 3,
                                      shadowColor: "#000",
                                      shadowOpacity: 0.10,
                                      shadowOffset: { width: 0, height: 2 },
                                      shadowRadius: 2,
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
                        {showLevelDialog && (
                          <Modal
                            visible={showLevelDialog}
                            transparent
                            animationType="fade"
                            onRequestClose={() => setShowLevelDialog(false)}
                          >
                            <View
                              style={{
                                flex: 1,
                                backgroundColor: "rgba(0,0,0,0.3)",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <View
                                style={{
                                  backgroundColor: Color.white,
                                  borderRadius: 16,
                                  padding: 24,
                                  width: "80%",
                                  maxWidth: 400,
                                  elevation: 8,
                                  alignItems: "center",
                                }}
                              >
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    width: "100%",
                                    marginBottom: 8,
                                  }}
                                >
                                  <Text style={{ color: Color.gray, fontWeight: "800", fontSize: 18 }}>Not allowed</Text>
                                  <IconButton
                                    icon={(p) => <CloseIcon width={18} height={18} fillColor={Color.gray} {...p} />}
                                    onPress={() => setShowLevelDialog(false)}
                                    style={{ margin: 0 }}
                                    accessibilityLabel="Close dialog"
                                  />
                                </View>
                                <Text style={{ color: Color.gray, textAlign: "center" }}>
                                  You cannot select a game level higher than your current CEFR level.
                                </Text>
                              </View>
                            </View>
                          </Modal>
                        )}
                        <View style={{ flexDirection: "column", gap: 8 }}>
                          <Text style={{ fontWeight: "700", color: Color.gray, marginTop: 13 }}>Timer</Text>
                          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                            {TIMER_OPTIONS.map((t) => {
                              const active = timer === t;
                              return (
                                <Button
                                  key={t}
                                  style={{
                                    marginRight: 8,
                                    marginBottom: 1,
                                    borderRadius: 20,
                                    elevation: 3,
                                    shadowColor: "#000",
                                    shadowOpacity: 0.10,
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowRadius: 2,
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
                          <Text style={{ fontWeight: "700", color: Color.gray, marginTop: 18  }}>Game Privacy</Text>
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
                        </View>
                        <View style={{ flexDirection: "column", gap: 8}}>
                          <Text style={{ fontWeight: "700", color: Color.gray, marginTop: 18  }}>
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
                                    elevation: 3,
                                    shadowColor: "#000",
                                    shadowOpacity: 0.10,
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowRadius: 2,
                                    backgroundColor: isActive ? "#58A7F8" : "#fff",
                                    borderColor: "#ddd",
                                  }}
                                  onPress={() => handleUploadTypeSelect(key)}
                                  contentStyle={{ flexDirection: "row-reverse" }}
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

                  </KeyboardAvoidingView>
                </View>
              </Pressable>
            </Pressable>
          </Modal>
        )
      }
      <LoadingPopupCreateGame
        visible={isCreating}
      />
    </>
  );
};

export default CreateGameModal;