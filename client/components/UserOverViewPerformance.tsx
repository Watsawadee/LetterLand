import React, { useEffect, useMemo, useRef, useState } from "react"
import { View, Text, ScrollView, Image, TouchableOpacity, Platform } from "react-native"
import { useTotalGamesPerPeriod, usePeerAverageGamesPerPeriod, useUserTotalPlaytime, useUserWordLearned, useUserGameStreak, useUserProgress } from "@/hooks/useDashboard";
import { Color } from "@/theme/Color";
import { Button, Card, Checkbox, IconButton, List, Modal, PaperProvider, Portal } from "react-native-paper";
import { ActivityIndicator } from "react-native";
import Clock from "@/assets/icon/Clock";
import Pencil from "@/assets/icon/Pencil";
import {
    VictoryAxis, VictoryBar, VictoryChart, VictoryLabel, VictoryLine, VictoryPie, VictoryScatter, VictoryTheme, VictoryTooltip,
    VictoryVoronoiContainer,
} from "victory-native";
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
import { endOfMonth, endOfWeek, endOfYear, format, startOfMonth, startOfWeek, startOfYear } from "date-fns";
import { useColorScheme } from "react-native";
import { Defs, LinearGradient, Stop } from "react-native-svg";
import { FloatingBubble } from "@/assets/images/bubblePopup";


const UserOverviewPerformance = () => {
    const [forceLoading, setForceLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [showBook, setShowBook] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [tempDate, setTempDate] = useState<Date>(new Date());
    const [monthRange, setMonthRange] = useState<{ start: Date; end: Date } | null>(null);

    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === "dark";

    const [period, setPeriod] = useState<"week" | "month" | "year">("week");
    const handleDateConfirm = (date: Date) => {
        let start: Date;
        let end: Date;

        if (period === "week") {
            start = startOfWeek(date, { weekStartsOn: 0 }); // 0 = Sunday
            end = endOfWeek(date, { weekStartsOn: 0 });
        } else if (period === "month") {
            start = startOfMonth(date);
            end = endOfMonth(date);
        } else if (period === "year") {
            start = startOfYear(date);
            end = endOfYear(date);
        } else {
            start = date;
            end = date;
        }

        setSelectedDate(date);
        setMonthRange({ start, end });
        setShowPicker(false);
    };

    const formattedEndDate = monthRange ? monthRange.end.toISOString().split("T")[0] : selectedDate.toISOString().split("T")[0];


    const CHART_W = 750;
    const CHART_H = 300;


    useEffect(() => {
        const timer = setTimeout(() => setForceLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);
    const formatDateRange = (startStr: string, endStr: string, period: "week" | "month" | "year") => {
        const start = new Date(startStr);
        const end = new Date(endStr);

        const formatOptions: Intl.DateTimeFormatOptions = {
            day: "2-digit",
            month: "short",
            year: "numeric",
            timeZone: "UTC",
        };

        const startFormatted = start.toLocaleDateString("en-GB", formatOptions);
        const endFormatted = end.toLocaleDateString("en-GB", formatOptions);

        if (
            period === "week" ||
            (period === "month" && start.getUTCMonth() === end.getUTCMonth() && start.getUTCFullYear() === end.getUTCFullYear())
        ) {
            return `${start.getUTCDate()} ${start.toLocaleString("en-GB", {
                month: "short",
                timeZone: "UTC",
            })} ${start.getUTCFullYear()} – ${end.getUTCDate()} ${end.toLocaleString("en-GB", {
                month: "short",
                timeZone: "UTC",
            })} ${end.getUTCFullYear()}`;
        }
        return `${startFormatted} – ${endFormatted}`;
    };


    const { data: TotalgamesData, isLoading: loadingChart } = useTotalGamesPerPeriod(period, formattedEndDate);
    const { data: peerAvgData, isLoading: loadingPeer } = usePeerAverageGamesPerPeriod(period, formattedEndDate);
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
            value: streakData && "highestStreakInThisLevel" in streakData ? streakData.highestStreakInThisLevel : "-",
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
                                        backgroundColor: "#F2F8F9",
                                        borderRadius: 16,
                                        padding: 20,
                                        width: CHART_W,
                                        position: "relative",
                                        overflow: "hidden",
                                    }}
                                >
                                    {/* <FloatingBubble cardWidth={CHART_W} cardHeight={CHART_H} /> */}
                                    <Card.Title
                                        title={
                                            isSuccess(TotalgamesData)
                                                ? `Games Played (${formatDateRange(
                                                    TotalgamesData.range.start,
                                                    TotalgamesData.range.end,
                                                    period
                                                )})`
                                                : "Games Played"
                                        }

                                        titleStyle={{ color: Color.gray, fontWeight: "bold", fontSize: 20 }}
                                    />
                                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                        <View style={{ display: "flex", flexDirection: "row" }}>
                                            {(["week", "month", "year"] as const).map((p) => (
                                                <Button
                                                    key={p}
                                                    onPress={() => {
                                                        setPeriod(p);
                                                        setShowPicker(true);
                                                        setTempDate(selectedDate);
                                                    }}
                                                    style={{
                                                        backgroundColor: p === period ? Color.blue : Color.white,
                                                        paddingHorizontal: 8,
                                                        borderRadius: 999,
                                                        marginHorizontal: 6,
                                                    }}
                                                    rippleColor={"transparent"}
                                                >
                                                    <Text style={{ color: p === period ? Color.white : Color.blue, fontWeight: "bold" }}>
                                                        {p.charAt(0).toUpperCase() + p.slice(1)}
                                                    </Text>
                                                </Button>
                                            ))}
                                        </View>
                                        <View style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end", gap: 10 }}>
                                            <View style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 5 }}>
                                                <View style={{ backgroundColor: Color.blue, width: 25, height: 3, borderRadius: 20 }} />
                                                <Text style={{ color: Color.blue, fontWeight: Typography.header20.fontWeight }}>Your game played</Text>
                                            </View>
                                            <View style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 5 }}>
                                                <View style={{ backgroundColor: Color.green, width: 25, height: 3, borderRadius: 20 }} />
                                                <Text style={{ color: Color.green, fontWeight: Typography.header20.fontWeight }}>Average of peers</Text>
                                            </View>
                                        </View>
                                    </View>
                                    {showPicker && (
                                        <DateTimePickerModal
                                            isVisible={showPicker}
                                            mode="date"
                                            display="inline"
                                            date={selectedDate}
                                            onConfirm={() => {

                                            }}
                                            maximumDate={new Date}
                                            onCancel={() => setShowPicker(false)}
                                            onChange={(date) => {
                                                if (date) setTempDate(date);
                                            }}
                                            textColor={Color.gray}
                                            themeVariant="light"
                                            pickerContainerStyleIOS={{
                                                backgroundColor: Color.white,
                                                borderRadius: 24,
                                                width: 420,
                                                alignSelf: "center",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                shadowColor: "#000",
                                                shadowOpacity: 0.1,
                                                shadowRadius: 6,
                                                shadowOffset: { width: 0, height: 3 },
                                            }}
                                            customHeaderIOS={() => (
                                                <Text
                                                    style={{
                                                        textAlign: "center",
                                                        color: Color.gray,
                                                        fontWeight: "700",
                                                        paddingVertical: 12,
                                                        fontSize: 20,
                                                    }}
                                                >
                                                    Choose {period}
                                                </Text>
                                            )}
                                            customConfirmButtonIOS={() => (

                                                <Button
                                                    onPress={() => handleDateConfirm(tempDate)}
                                                    style={{
                                                        alignSelf: "center",
                                                        width: "100%",
                                                        borderTopColor: Color.gray,
                                                        borderTopWidth: 0.5,
                                                        backgroundColor: "transparent",
                                                        paddingTop: 5,
                                                    }}

                                                    rippleColor="transparent"
                                                >
                                                    <Text style={{ color: Color.gray, fontSize: 18, fontWeight: "600" }}>
                                                        Confirm
                                                    </Text>
                                                </Button>
                                            )}
                                            customCancelButtonIOS={() => (
                                                <Button
                                                    onPress={() => setShowPicker(false)}
                                                    style={{
                                                        backgroundColor: Color.lightblue,
                                                        borderRadius: 12,
                                                        alignSelf: "center",
                                                        width: "36%",
                                                        marginBottom: 20
                                                    }}
                                                    rippleColor="transparent"
                                                >
                                                    <Text style={{ color: "red", fontSize: 18, fontWeight: "600" }}>
                                                        Cancel
                                                    </Text>
                                                </Button>
                                            )}
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
                                        <Defs>
                                            <LinearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                <Stop offset="0%" stopColor={Color.blue} />
                                                <Stop offset="100%" stopColor="#4584ccff" />
                                            </LinearGradient>
                                        </Defs>
                                        <VictoryBar
                                            data={periodSeries}
                                            barWidth={30}
                                            cornerRadius={10}
                                            style={{
                                                data: { fill: "url(#barGradient)" }
                                            }}
                                            labels={({ datum }) => `${datum.y} games`}
                                            labelComponent={
                                                <VictoryTooltip
                                                    flyoutStyle={{
                                                        fill: "#fff",
                                                        stroke: Color.black,
                                                        strokeWidth: 1,
                                                    }}
                                                    style={{
                                                        fill: Color.gray,
                                                        fontWeight: "600",
                                                        fontSize: 13,
                                                        textAlign: "center",
                                                    }}
                                                    flyoutPadding={{ top: 8, bottom: 8, left: 10, right: 10 }}
                                                    activateData={true}
                                                />
                                            }
                                            events={[
                                                {
                                                    target: "data",
                                                    eventHandlers: {
                                                        onPressIn: () => [{ target: "labels", mutation: () => ({ active: true }) }],
                                                        onPressOut: () => [{ target: "labels", mutation: () => ({ active: false }) }],
                                                    },
                                                },
                                            ]}
                                            animate={{ duration: 1000, easing: "bounce" }}
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
                                                labelComponent={<VictoryLabel dy={-10} style={{ fill: Color.green, fontSize: 12, stroke: Color.green, strokeWidth: 1 }} />}
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
                        paddingVertical: 20,
                        paddingHorizontal: 30,
                        maxHeight: "100%",
                        width: "70%",
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
                                        {formatDateRange(
                                            TotalgamesData.range.start,
                                            TotalgamesData.range.end,
                                            period)}
                                    </Text>
                                </View>
                                <IconButton
                                    icon={(p) => <CloseIcon width={18} height={18} fillColor={Color.gray} {...p} />}
                                    onPress={() => setModalVisible(false)}
                                    style={{ margin: 0 }}
                                    accessibilityLabel="Close dialog"
                                />
                            </View>
                            <ScrollView style={{ flexGrow: 0 }}
                                contentContainerStyle={{ paddingBottom: 100 }}
                                keyboardShouldPersistTaps="handled"
                                nestedScrollEnabled={true}>
                                <View style={{ flexDirection: "column", justifyContent: "space-between", height: "100%" }}>

                                    <View style={{ width: "100%", height: "30%", }}>
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
                                                            {card.value as any}
                                                        </Text>
                                                    </Card>
                                                ))
                                            )}
                                            {/* </ScrollView> */}
                                        </View>
                                    </View>
                                    {/* <View style={{ width: "100%" }}>
                                        <Text style={{ fontWeight: "bold", fontSize: 20, color: Color.gray, marginBottom: 5, textAlign: "left" }}>
                                            Average Gameplayed
                                        </Text>
                                    </View> */}
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
                                                            cornerRadius={5}
                                                            labels={() => null}
                                                            padding={45}
                                                        />
                                                        <View
                                                            style={{
                                                                position: "absolute",
                                                                top: "50%",
                                                                left: "50%",
                                                                transform: [{ translateX: -240 }, { translateY: -20 }],
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

                                                    <View style={{ minWidth: "70%", flexDirection: "column", justifyContent: "center", gap: 20 }}>
                                                        {userProgress.summary.map((line, idx) => (
                                                            // <List.Item
                                                            //     key={idx}
                                                            //     title={line}
                                                            //     titleNumberOfLines={3}
                                                            //     titleStyle={{
                                                            //         color: Color.blue,
                                                            //         fontSize: Typography.body16.fontSize,
                                                            //         lineHeight: 20,
                                                            //         textAlign: "center"
                                                            //     }}
                                                            //     left={(props) => (
                                                            //         <List.Icon
                                                            //             {...props}
                                                            //             icon="alert-box"
                                                            //             color={Color.yellow}
                                                            //             style={{ marginRight: 0 }}
                                                            //         />
                                                            //     )}
                                                            //     style={{
                                                            //         backgroundColor: Color.gray,
                                                            //         borderRadius: 10,
                                                            //         paddingHorizontal: 20,
                                                            //         width: "90%"
                                                            //     }}
                                                            // />
                                                            <Card
                                                                key={idx}
                                                                mode="elevated"
                                                                style={{
                                                                    backgroundColor: "#F8FBFF",
                                                                    borderRadius: 14,
                                                                    minWidth: "90%",
                                                                    paddingVertical: 10,
                                                                    paddingHorizontal: 15,
                                                                    elevation: 2,
                                                                    flexDirection: "row",
                                                                    alignItems: "center",
                                                                }}
                                                            >
                                                                <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                                                                    <View
                                                                        style={{
                                                                            width: 32,
                                                                            height: 32,
                                                                            borderRadius: 8,
                                                                            backgroundColor: "#FFE58B",
                                                                            flexDirection: "row",
                                                                            justifyContent: "center",
                                                                            alignItems: "center",
                                                                            marginRight: 12,
                                                                        }}
                                                                    >
                                                                        <Text style={{ color: "#A67C00", fontWeight: "bold", fontSize: 18 }}>!</Text>
                                                                    </View>
                                                                    <Text
                                                                        style={{
                                                                            flexShrink: 1,
                                                                            color: Color.blue,
                                                                            fontSize: Typography.body16.fontSize,
                                                                            fontWeight: "500",
                                                                            lineHeight: 22,
                                                                        }}
                                                                    >
                                                                        {line}
                                                                    </Text>
                                                                </View>
                                                            </Card>
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