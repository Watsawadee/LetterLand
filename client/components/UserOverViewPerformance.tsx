import React, { useEffect, useMemo, useRef, useState } from "react"
import { View, Text, ScrollView, Image, TouchableOpacity, Platform } from "react-native"
import { useTotalGamesPerPeriod, usePeerAverageGamesPerPeriod, useUserTotalPlaytime, useUserWordLearned, useUserGameStreak, useUserProgress } from "@/hooks/useDashboard";
import { Color } from "@/theme/Color";
import { Button, Card, Checkbox, IconButton, List, Modal, PaperProvider, Portal } from "react-native-paper";
import { ActivityIndicator } from "react-native";
import Clock from "@/assets/icon/Clock";
import Pencil from "@/assets/icon/Pencil";
import { VictoryAxis, VictoryBar, VictoryChart, VictoryLabel, VictoryLine, VictoryPie, VictoryScatter, VictoryTheme, VictoryVoronoiContainer } from "victory-native";
import { Dimensions } from "react-native";
import Carousel, { Pagination, ICarouselInstance } from "react-native-reanimated-carousel";
import { useSharedValue } from "react-native-reanimated";
import { Typography } from "@/theme/Font";
import NoGamePlayed from "@/assets/backgroundTheme/NoGamePlayed";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import ArrowLeft from "@/assets/icon/ArrowLeft";
import CloseIcon from "@/assets/icon/CloseIcon";
import WordBankModal from "./WordBank";
import Book from "@/assets/icon/Book";
import { ButtonStyles } from "@/theme/ButtonStyles";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from "date-fns";


const MAX_WEEKS = 5;
const UserOverviewPerformance = () => {
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [forceLoading, setForceLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [showBook, setShowBook] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [tempDate, setTempDate] = useState<Date>(new Date());

    const [period, setPeriod] = useState<"week" | "month" | "year">("week");
    const handleDateChange = (event: any, date?: Date) => {
        if (Platform.OS !== "ios") setShowPicker(false);

        if (date) {
            setSelectedDate(date);
            setPeriod(period);
        }
    };

    const handleConfirm = (date: Date) => {
        setSelectedDate(date);
        setShowPicker(false);
    }
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };


    const CHART_W = 750;
    const CHART_H = 300;


    const GAP = 20;
    const [carouselProgress, setCarouselProgress] = useState(0);
    const progress = useSharedValue<number>(0);
    const ref = useRef<ICarouselInstance>(null);
    useEffect(() => {
        const timer = setTimeout(() => setForceLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);
    const formattedDate = selectedDate.toISOString().split("T")[0];

    const { data: TotalgamesData, isLoading: loadingChart } = useTotalGamesPerPeriod(period, formattedDate);
    const { data: peerAvgData, isLoading: loadingPeer } = usePeerAverageGamesPerPeriod(period, formattedDate);
    const { data: userProgress, isLoading: loadingProgress } = useUserProgress();

    const { data: totalPlaytime } = useUserTotalPlaytime();
    const { data: wordsLearned } = useUserWordLearned();
    const { data: streakData, isLoading: loadingStreak } = useUserGameStreak();
    const streakCards = [
        {
            label: "Your Longest Streak Ever",
            value: streakData && "allTime" in streakData ? streakData.allTime : "-",
        },
        {
            label: "Your Ongoing Streak in This Level",
            value: streakData && "currentLevel" in streakData ? streakData.currentLevel : "-",
        },
        {
            label: "Top Streak in Your Level",
            value: streakData && "highestsStreakInThisLevel" in streakData ? streakData.highestsStreakInThisLevel : "-",
        },
    ];
    function isSuccess<T>(data: T | undefined): data is Exclude<T, { error: string }> {
        return !!data && typeof data === "object" && !("error" in data);
    }
    const periodSeries =
        isSuccess(TotalgamesData)
            ? TotalgamesData.labels.map((label, i) => ({
                x: label,
                y: TotalgamesData.counts[i],
            }))
            : [];

    const peerSeries =
        isSuccess(peerAvgData)
            ? peerAvgData.labels.map((label, i) => ({
                x: label,
                y: peerAvgData.counts[i],
            }))
            : [];
    const maxY = isSuccess(TotalgamesData)
        ? Math.max(1, ...TotalgamesData.counts)
        : 1;


    const router = useRouter();
    const loading = loadingChart || loadingPeer || loadingProgress;
    return (
        <>
            <View style={{ width: "69%", height: "100%", gap: 15 }}>
                <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                    <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
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
                        <Text style={{ color: Color.gray, fontSize: 20, fontWeight: "bold" }}>Dashboard</Text>
                    </View>
                    <TouchableOpacity
                        style={[ButtonStyles.wordBank.container, { flexDirection: "row", alignItems: "center" }]}
                        onPress={() => setShowBook(true)}
                    >
                        <Book width={50} height={50} style={{ marginRight: 4 }} />
                        <View style={{ flexDirection: "column", alignItems: "flex-start", paddingLeft: 8 }}>
                            <Text style={ButtonStyles.wordBank.text}>Word</Text>
                            <Text style={ButtonStyles.wordBank.text}>Bank</Text>
                        </View>
                    </TouchableOpacity>

                    {/* modal */}
                    <WordBankModal visible={showBook} onClose={() => setShowBook(false)} />



                </View>
                <View style={{ height: "84%", flexDirection: "column", justifyContent: "space-between" }}>

                    <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 10 }}>
                        <View style={{ alignItems: "center" }}>
                            {loading ? (
                                <ActivityIndicator size="large" />
                            ) : isSuccess(TotalgamesData) && isSuccess(peerAvgData) ? (
                                <Card
                                    style={{
                                        backgroundColor: Color.white,
                                        borderRadius: 16,
                                        padding: 20,
                                        width: CHART_W,
                                    }}
                                >
                                    <Card.Title
                                        title={
                                            isSuccess(TotalgamesData)
                                                ? `Games Played (${formatDate(TotalgamesData.range.start)} - ${formatDate(TotalgamesData.range.end)})`
                                                : "Games Played"
                                        }
                                        titleStyle={{ color: Color.gray, fontWeight: "bold", fontSize: 20 }}
                                    />
                                    <View style={{ display: "flex", flexDirection: "row" }}>
                                        {(["week", "month", "year"] as const).map((p) => (
                                            <Button
                                                key={p}
                                                onPress={() => {
                                                    setPeriod(p);
                                                    setTempDate(selectedDate);
                                                    setShowPicker(true);
                                                }}
                                                style={{
                                                    backgroundColor: p === period ? Color.blue : Color.white,
                                                    paddingHorizontal: 8,
                                                    borderRadius: 999,
                                                    marginHorizontal: 6,
                                                }}
                                            >
                                                <Text style={{ color: p === period ? Color.white : Color.blue, fontWeight: "bold" }}>
                                                    {p.charAt(0).toUpperCase() + p.slice(1)}
                                                </Text>
                                            </Button>
                                        ))}
                                    </View>
                                    {showPicker && (
                                        <DateTimePickerModal
                                            isVisible={showPicker}
                                            mode="date"
                                            date={selectedDate}
                                            onChange={(date) => {
                                                if (date) setTempDate(date);
                                            }}
                                            onConfirm={(date) => {
                                                setSelectedDate(date);
                                                setShowPicker(false);
                                            }}
                                            onCancel={() => setShowPicker(false)}
                                            maximumDate={new Date()}
                                            pickerContainerStyleIOS={{
                                                backgroundColor: Color.white,
                                                borderRadius: 20,
                                                alignSelf: "center",
                                                alignItems: "center",
                                                width: "40%"
                                            }}
                                            customHeaderIOS={() => (
                                                <Text
                                                    style={{
                                                        textAlign: "center",
                                                        color: "#007ff9",
                                                        fontWeight: "bold",
                                                        paddingVertical: 10,
                                                        fontSize: 18,
                                                    }}
                                                >
                                                    Choose {period}
                                                </Text>
                                            )}
                                            customCancelButtonIOS={() => (
                                                <Button
                                                    style={{ width: "40%", alignSelf: "center", backgroundColor: Color.white, borderRadius: 13, marginBottom: 10 }}
                                                    onPress={() => setShowPicker(false)}
                                                    rippleColor={"transparent"}

                                                >
                                                    <Text style={{
                                                        color: "#007ff9",
                                                        paddingVertical: 10,
                                                        fontSize: 21,
                                                        width: "40%"
                                                    }}>
                                                        Cancel
                                                    </Text>

                                                </Button>
                                            )}
                                            customConfirmButtonIOS={() => (
                                                <Button
                                                    style={{ width: "40%", alignSelf: "center", backgroundColor: Color.white, borderRadius: 10 }}
                                                    onPress={() => {
                                                        setSelectedDate(tempDate);
                                                        setShowPicker(false);
                                                    }}
                                                    rippleColor={"transparent"}

                                                >
                                                    <Text style={{
                                                        color: "#007ff9",
                                                        paddingVertical: 10,
                                                        fontSize: 19,
                                                        width: "40%"
                                                    }}>
                                                        Confirm
                                                    </Text>

                                                </Button>
                                            )}
                                            confirmTextIOS="Confirm"
                                            cancelTextIOS="Cancel"
                                            textColor="#000"
                                            isDarkModeEnabled={false}
                                        />
                                    )}

                                    <VictoryChart
                                        theme={VictoryTheme.material}
                                        width={CHART_W}
                                        height={CHART_H}
                                        domainPadding={{ x: [30, 40] }}
                                        domain={{ y: [0, maxY + 2] }}
                                    >
                                        <VictoryAxis
                                            tickValues={TotalgamesData.labels}
                                            style={{ tickLabels: { fontSize: 12, fill: Color.gray } }}
                                        />
                                        <VictoryAxis dependentAxis />
                                        <VictoryBar
                                            data={periodSeries}
                                            barWidth={25}
                                            cornerRadius={5}
                                            style={{
                                                data: { fill: Color.blue },
                                                labels: { fill: Color.gray, fontSize: 13, fontWeight: "bold" },
                                            }}
                                            labels={({ datum }) => (datum.y !== 0 ? `${datum.y}` : "")}
                                            labelComponent={<VictoryLabel dy={-8} textAnchor="middle" />}
                                        />
                                        {peerSeries.some((d) => d.y !== 0) && ([
                                            <VictoryLine
                                                data={peerSeries}
                                                style={{ data: { stroke: Color.green, strokeWidth: 3 } }}
                                            />,
                                            <VictoryScatter
                                                data={peerSeries}
                                                size={5}
                                                style={{ data: { fill: Color.green } }}
                                                labels={({ datum }) => datum.y.toFixed(1)}
                                                labelComponent={<VictoryLabel dy={-10} style={{ fill: Color.green, fontSize: 12 }} />}
                                            />
                                        ])}
                                    </VictoryChart>
                                </Card>
                            ) : (
                                <Text style={{ color: Color.gray }}>No chart data available</Text>
                            )}
                        </View>
                    </View>

                    <View
                        style={{
                            width: "100%",
                            height: "20%",
                            alignSelf: "center",
                        }}
                    >
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 25 }}>
                            <Text style={{ fontSize: Typography.header20.fontSize, fontWeight: Typography.header20.fontWeight, color: Color.gray }}>Overview statistcs</Text>
                            <Button onPress={() => {
                                setModalVisible(true);
                            }}
                                rippleColor={"transparent"}
                            >
                                <Text style={{ color: Color.blue }} >
                                    More details
                                </Text>
                            </Button>
                        </View>
                        <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-around", height: "100%" }}>
                            <Card style={{ width: "45%", height: "100%", backgroundColor: "#F2F8F9", padding: 10, justifyContent: "center", alignItems: "center" }}>
                                <View style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                                    <Pencil width={50} height={50} />
                                    <View style={{ display: "flex", flexDirection: "column" }}>
                                        <Text style={{ fontWeight: "bold" }}>
                                            Total Words Learned
                                        </Text>
                                        <Text style={{ color: Color.gray }}>{wordsLearned && "error" in wordsLearned
                                            ? "Error"
                                            : wordsLearned && "wordsLearned" in wordsLearned
                                                ? `${wordsLearned.wordsLearned} Word(s)`
                                                : "0 Word(s)"}</Text>
                                    </View>
                                </View>
                            </Card>
                            <Card style={{ width: "45%", height: "100%", backgroundColor: "#F2F8F9", padding: 10, justifyContent: "center", alignItems: "center" }}>
                                <View style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                                    <Clock width={50} height={50} />
                                    <View style={{ display: "flex", flexDirection: "column", }}>
                                        <Text style={{ fontWeight: "bold" }}>
                                            Total Playtime
                                        </Text>
                                        <Text style={{ color: Color.gray }}> {totalPlaytime && "error" in totalPlaytime
                                            ? "Error"
                                            : totalPlaytime && "totalPlaytime" in totalPlaytime
                                                ? `${totalPlaytime.totalPlaytime} Hour(s)`
                                                : "0 Hour(s)"}</Text>
                                    </View>
                                </View>
                            </Card>
                        </View>
                    </View >
                </View >
            </View >
            <Portal >
                <Modal
                    visible={modalVisible}
                    onDismiss={() => setModalVisible(false)}
                    contentContainerStyle={{
                        backgroundColor: Color.white,
                        margin: 20,
                        borderRadius: 16,
                        alignSelf: "center",
                        // justifyContent: "flex-start",
                        padding: 30,
                        height: "100%",
                        width: "70%"
                    }}
                >
                    {loading ? (
                        <ActivityIndicator />
                    ) : isSuccess(TotalgamesData) && isSuccess(peerAvgData) ? (
                        <View style={{ width: "90%", flexDirection: "column", gap: 30, height: "100%", alignSelf: "center" }}>
                            <View style={{ flexDirection: "row" }}>
                                <View style={{ flexDirection: "column", alignItems: "center", width: "100%" }}>
                                    <Text style={{ fontWeight: "bold", fontSize: 20, color: Color.gray, marginBottom: 5 }}>
                                        Overall Information
                                    </Text>
                                    <Text style={{ fontWeight: "bold", fontSize: 16, color: Color.gray }}>
                                        {period.charAt(0).toUpperCase() + period.slice(1)}:{" "}
                                        {formatDate(TotalgamesData.range.start)} - {formatDate(TotalgamesData.range.end)}
                                    </Text>
                                </View>
                                <IconButton
                                    icon={(p) => <CloseIcon width={18} height={18} fillColor={Color.gray} {...p} />}
                                    onPress={() => setModalVisible(false)}
                                    style={{ margin: 0 }}
                                    accessibilityLabel="Close dialog"
                                />
                            </View>
                            <ScrollView horizontal={false} style={{ height: "100%", minWidth: "100%" }}>
                                <View style={{ flexDirection: "column", justifyContent: "space-between", height: "100%" }}>

                                    <View style={{ width: "100%", height: "100%", }}>
                                        <Text style={{ fontWeight: "bold", fontSize: 20, color: Color.gray, marginBottom: 5, textAlign: "left" }}>
                                            Gameplayed Streak
                                        </Text>
                                        <View style={{ display: "flex", flexDirection: "row", gap: 5, justifyContent: "space-around", height: "100%" }}>
                                            {/* <ScrollView horizontal={true} style={{ width: "100%" }}> */}
                                            {loadingStreak ? (
                                                <ActivityIndicator />
                                            ) : (
                                                streakCards.map((card, idx) => (
                                                    <Card key={idx} style={{ backgroundColor: Color.blue, padding: 10, height: "80%", width: "32%", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                                        <Text style={{ color: Color.white, fontWeight: "bold", fontSize: 16, textAlign: "center" }}>
                                                            {card.label}
                                                        </Text>
                                                        <Text style={{ color: Color.white, fontSize: 22, marginTop: 8, textAlign: "center" }}>
                                                            {card.value as number}
                                                        </Text>
                                                    </Card>
                                                ))
                                            )}
                                            {/* </ScrollView> */}
                                        </View>
                                    </View>
                                    <View style={{ width: "100%" }}>
                                        <Text style={{ fontWeight: "bold", fontSize: 20, color: Color.gray, marginBottom: 5, textAlign: "left" }}>
                                            Average Gameplayed
                                        </Text>
                                    </View>
                                    <View style={{ width: "100%" }}>
                                        <Text style={{ fontWeight: "bold", fontSize: 20, color: Color.gray, marginBottom: 5, textAlign: "left" }}>
                                            User Current Progress
                                        </Text>
                                        {loadingProgress ? (
                                            <ActivityIndicator />
                                        ) : isSuccess(userProgress) ? (
                                            <>
                                                <View
                                                    style={{
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        // marginVertical: 10,
                                                    }}
                                                >
                                                    <View style={{ position: "relative", alignItems: "center", justifyContent: "center" }}>
                                                        <VictoryPie
                                                            data={[
                                                                { x: "Progress", y: userProgress.donut.filled },
                                                                { x: "Remaining", y: userProgress.donut.remaining },
                                                            ]}
                                                            width={250}
                                                            height={250}
                                                            colorScale={[Color.green, "#EAEAEA"]}
                                                            innerRadius={70}
                                                            labels={() => null}
                                                            padding={45}
                                                        />
                                                        <View
                                                            style={{
                                                                position: "absolute",
                                                                top: "50%",
                                                                left: "50%",
                                                                transform: [{ translateX: -15 }, { translateY: -30 }],
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                            }}
                                                        >
                                                            <Text
                                                                style={{
                                                                    fontSize: 25,
                                                                    fontWeight: "bold",
                                                                    color: Color.gray,
                                                                    textAlign: "center",
                                                                }}
                                                            >
                                                                {userProgress.donut.filled.toFixed(0)}%
                                                            </Text>
                                                            <Text
                                                                style={{
                                                                    color: Color.gray,
                                                                    fontSize: 16,
                                                                    textAlign: "center",
                                                                    fontWeight: "500",
                                                                }}
                                                            >
                                                                {userProgress.englishLevel}
                                                            </Text>
                                                        </View>
                                                    </View>

                                                    <View style={{ minWidth: "60%", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                                                        {userProgress.summary.map((line, idx) => (
                                                            <List.Item
                                                                key={idx}
                                                                title={line}
                                                                titleNumberOfLines={3}
                                                                titleStyle={{
                                                                    color: Color.blue,
                                                                    fontSize: Typography.body16.fontSize,
                                                                    lineHeight: 20,
                                                                    textAlign: "center"
                                                                }}
                                                                left={(props) => (
                                                                    <List.Icon
                                                                        {...props}
                                                                        icon="alert-box"
                                                                        color={"red"}
                                                                        style={{ marginRight: 0 }}
                                                                    />
                                                                )}
                                                                style={{
                                                                    backgroundColor: "transparent",
                                                                    borderRadius: 10,
                                                                    paddingHorizontal: 20,
                                                                    width: "100%"
                                                                }}
                                                            />
                                                        ))}
                                                    </View>
                                                </View>
                                            </>
                                        ) : (
                                            <Text style={{ color: Color.gray }}>No progress data available</Text>
                                        )}
                                    </View>
                                </View>

                            </ScrollView>


                        </View>
                    ) : (
                        <Text>No data available</Text>
                    )
                    }

                </Modal >
            </Portal >
        </>
    );
};

export default UserOverviewPerformance;