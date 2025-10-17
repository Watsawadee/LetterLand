import React, { useEffect, useMemo, useRef, useState } from "react"
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native"
import { useTotalGamesPerPeriod, usePeerAverageGamesPerPeriod, useUserTotalPlaytime, useUserWordLearned } from "@/hooks/useDashboard";
import { Color } from "@/theme/Color";
import { Button, Card, Checkbox, IconButton, Modal, Portal } from "react-native-paper";
import { ActivityIndicator } from "react-native";
import Clock from "@/assets/icon/Clock";
import Pencil from "@/assets/icon/Pencil";
import { VictoryAxis, VictoryBar, VictoryChart, VictoryLabel, VictoryLine, VictoryScatter, VictoryTheme, VictoryVoronoiContainer } from "victory-native";
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
const MAX_WEEKS = 5;
const UserOverviewPerformance = () => {
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [forceLoading, setForceLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [showBook, setShowBook] = useState(false);
    const [period, setPeriod] = useState<"week" | "month" | "year">("week");

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

    const { data: TotalgamesData, isLoading: loadingChart } = useTotalGamesPerPeriod(period);
    const { data: peerAvgData, isLoading: loadingPeer } = usePeerAverageGamesPerPeriod(period);
    const { data: totalPlaytime } = useUserTotalPlaytime();
    const { data: wordsLearned } = useUserWordLearned();

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
    // function getLongestStreak(counts: number[]): number {
    //     let maxStreak = 0;
    //     let currentStreak = 0;
    //     for (let i = 0; i < counts.length; i++) {
    //         if (counts[i] > 0) {
    //             currentStreak++;
    //             maxStreak = Math.max(maxStreak, currentStreak);
    //         } else {
    //             currentStreak = 0;
    //         }
    //     }
    //     return maxStreak;
    // }
    // function isValidArray(arr1: number[] | undefined, arr2: number[] | undefined): boolean {
    //     return Array.isArray(arr1) && Array.isArray(arr2) && arr1.length === arr2.length && arr1.length > 0;
    // }

    // function getWeekLabels(startDateStr: string) {
    //     const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    //     const startDate = new Date(startDateStr);
    //     const startIdx = startDate.getUTCDay(); // 0=Sun, 6=Sat
    //     return Array.from({ length: 7 }, (_, i) => days[(startIdx + i) % 7]);
    // }

    // // Usage in your statCards:
    // const longestStreak = getLongestStreak(counts);

    // const statCards = [
    //     {
    //         key: "peak",
    //         content: (
    //             <Card style={{ backgroundColor: "#F2F8F9", padding: 16, borderRadius: 16, alignItems: "center", justifyContent: "center", width: 250, height: 100, marginHorizontal: 8 }}>
    //                 <Text style={{ fontWeight: "bold", color: Color.black }}>Peak Learning Day</Text>
    //                 <Text style={{ color: Color.blue, fontSize: 18, fontWeight: "bold" }}>
    //                     {labels[counts.indexOf(Math.max(...counts))]} — {Math.max(...counts)} games
    //                 </Text>
    //                 <Text style={{ color: Color.black }}>You’re most active on this day!</Text>
    //             </Card>
    //         ),
    //     },
    //     {
    //         key: "avg",
    //         content: (
    //             <Card style={{ backgroundColor: "#F2F8F9", padding: 16, borderRadius: 16, alignItems: "center", justifyContent: "center", width: 250, height: 100, marginHorizontal: 8 }}>
    //                 <Text style={{ color: Color.black, fontWeight: "bold", fontSize: 16 }}>
    //                     Average games played by all users this week:{" "}
    //                     <Text style={{ color: Color.blue, fontWeight: "bold", fontSize: 18 }}>{avgValue}</Text>
    //                 </Text>
    //             </Card>
    //         ),
    //     },
    //     {
    //         key: "level",
    //         content: (
    //             <Card style={{ backgroundColor: "#F2F8F9", padding: 16, borderRadius: 16, alignItems: "center", justifyContent: "center", width: 250, height: 100, marginHorizontal: 8 }}>
    //                 <Text style={{ fontWeight: "bold", color: Color.black }}>
    //                     English Level: <Text style={{ color: Color.black }}>{dailyData?.englishLevel}</Text>
    //                 </Text>
    //                 <Text style={{ color: Color.blue, fontWeight: "bold" }}>
    //                     {dailyData?.userCount} peers in this level
    //                 </Text>
    //             </Card>
    //         ),
    //     },
    //     {
    //         key: "streak",
    //         content: (
    //             <Card style={{ backgroundColor: "#F2F8F9", padding: 16, borderRadius: 16, alignItems: "center", justifyContent: "center", width: 250, height: 100, marginHorizontal: 8 }}>
    //                 <Text style={{ color: Color.black, fontWeight: "bold" }}>Longest Streak of this week</Text>
    //                 <Text style={{ color: Color.blue, fontSize: 18, fontWeight: "bold" }}>
    //                     {longestStreak} {longestStreak === 1 ? "day" : "days"}
    //                 </Text>
    //             </Card>
    //         ),
    //     },
    // ];
    // const renderChart = ({ index }: { index: number }) => {
    //     const weekOffset = index - (MAX_WEEKS - 1);
    //     const { data: weekData, isLoading: loadingChart, isError: chartError } = useTotalGamesThisWeek(weekOffset);
    //     const { data: avgGames } = useAverageGamesByLevel(weekOffset);
    //     const { data: dailyAvg } = useAverageGamesEachDay(weekOffset);

    //     if (chartError) {
    //         return (
    //             <View style={{ width: CHART_W, height: CHART_H, justifyContent: "center", alignItems: "center" }}>
    //                 <Text style={{ color: Color.gray }}>❌ Failed to load chart</Text>
    //             </View>
    //         );
    //     }

    //     if (loadingChart || !weekData) {
    //         return (
    //             <View style={{ width: CHART_W, height: CHART_H, justifyContent: "center", alignItems: "center" }}>
    //                 <ActivityIndicator size="large" />
    //             </View>
    //         );
    //     }

    //     const counts = weekData.counts ?? [0, 0, 0, 0, 0, 0, 0];
    //     const labels = weekData.labels ?? ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    //     const weekLabel = weekData.weekLabel ?? "";
    //     const maxY = Math.max(1, ...counts);
    //     const noGamePlayed = counts.every((c) => c === 0);

    //     // Calculate weeklySeries and peerSeries for this chart only
    //     const weeklySeries = labels.map((label, idx) => ({
    //         x: label,
    //         y: typeof counts[idx] === "number" ? counts[idx] : 0,
    //     }));

    //     const peerSeries = dailyAvg?.labels && dailyAvg?.counts
    //         ? dailyAvg.labels.map((label, idx) => ({
    //             x: label,
    //             y: typeof dailyAvg.counts[idx] === "number" && Number.isFinite(dailyAvg.counts[idx]) ? dailyAvg.counts[idx] : 0,
    //         }))
    //         : [];

    //     const modalTickValues = Array.from(new Set([
    //         ...weeklySeries.map(point => String(point.x)),
    //         ...peerSeries.map(point => String(point.x)),
    //     ]));

    //     if (noGamePlayed) {
    //         return (
    //             <View style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
    //                 <Card style={{
    //                     backgroundColor: Color.white, borderRadius: 16,
    //                     display: "flex",
    //                     justifyContent: "center",
    //                     alignItems: "center",
    //                     width: "100%",
    //                     height: "100%",
    //                 }}>
    //                     <Card.Title
    //                         title={weekLabel}
    //                         titleStyle={{ color: Color.gray, textAlign: "center", fontSize: 20 }}
    //                         style={{ alignItems: "center", paddingBottom: 0 }}
    //                     />
    //                     <Text style={{ color: Color.grey, fontWeight: "bold", fontSize: 20, textAlign: "center" }}>
    //                         No games played this week!
    //                     </Text>
    //                     <NoGamePlayed />
    //                 </Card>
    //             </View>
    //         );
    //     }

    //     return (
    //         <View style={{ flex: 1 }}>
    //             <Card style={{
    //                 backgroundColor: Color.white, borderRadius: 16,
    //                 overflow: "visible",
    //                 display: "flex",
    //                 justifyContent: "center",
    //                 alignItems: "center",
    //                 width: "100%",
    //                 height: "100%",
    //                 padding: 25
    //             }}>
    //                 <Card.Title
    //                     title={!("error" in weekData) && weekData?.range
    //                         ? weekData.offSet === 0
    //                             ? `This week detail (${weekLabel})`
    //                             : `${weekLabel}`
    //                         : "Week unavailable"
    //                     }
    //                     titleStyle={{ color: Color.gray, fontWeight: "bold", fontSize: 25, textAlign: "left" }}
    //                     style={{ width: "100%", paddingBottom: 0 }}
    //                 />
    //                 <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-start", paddingLeft: 20 }}>
    //                     <View style={{ flexDirection: "row", alignItems: "center" }}>
    //                         <View style={{ width: 30, height: 4, backgroundColor: Color.blue, marginRight: 8, borderRadius: 2 }} />
    //                         <Text style={{ marginRight: 20, color: Color.blue, fontWeight: "bold" }}>Your Games Played</Text>
    //                     </View>
    //                     <View style={{ flexDirection: "row", alignItems: "center" }}>
    //                         <View style={{ width: 30, height: 4, backgroundColor: "#71CB86", marginRight: 8, borderRadius: 2 }} />
    //                         <Text style={{ color: "#71CB86", fontWeight: "bold" }}>Average of Peers</Text>
    //                     </View>
    //                 </View>
    //                 <VictoryChart
    //                     theme={VictoryTheme.material}
    //                     width={CHART_W}
    //                     height={CHART_H - 30}
    //                     domainPadding={{ x: [30, 40] }}
    //                     domain={{ y: [0, maxY + 2] }}
    //                 >
    //                     <VictoryAxis
    //                         tickValues={modalTickValues}
    //                         style={{ tickLabels: { fontSize: 12, fill: Color.gray }, grid: { stroke: "#B5B5B5", strokeDasharray: "0" } }}
    //                     />
    //                     <VictoryAxis
    //                         dependentAxis
    //                         tickFormat={t => `${t}`}
    //                         style={{
    //                             grid: { stroke: "#B5B5B5", strokeDasharray: "0" },
    //                         }}
    //                     />
    //                     <VictoryBar
    //                         data={weeklySeries}
    //                         animate={{
    //                             duration: 1000,
    //                             onLoad: { duration: 800 },
    //                             onEnd: () => setBarAnimationDone(true),
    //                         }}
    //                         cornerRadius={5}
    //                         barWidth={25}
    //                         style={{
    //                             data: { fill: Color.blue, borderRadius: 6 },
    //                             labels: { fill: "#5B6073", fontSize: 15, fontWeight: "bold" },
    //                         }}
    //                         labels={({ datum }) => (barAnimationDone && datum.y !== 0 ? `${datum.y}` : "")}
    //                         labelComponent={<VictoryLabel dy={-8} textAnchor="middle" />}
    //                     />
    //                     <VictoryLine
    //                         key="line"
    //                         data={peerSeries}
    //                         style={{
    //                             data: { stroke: "#71CB86", strokeWidth: 4 },
    //                         }}
    //                     />
    //                     <VictoryScatter
    //                         key="scatter"
    //                         data={peerSeries}
    //                         size={5}
    //                         style={{ data: { fill: "#71CB86" } }}
    //                         labels={({ datum }) =>
    //                             typeof datum.y === "number" ? datum.y.toFixed(1) : ""
    //                         }
    //                         labelComponent={
    //                             <VictoryLabel
    //                                 dy={-10}
    //                                 style={{ fill: "#71CB86", fontSize: 15, fontWeight: "bold" }}
    //                             />
    //                         }
    //                     />
    //                 </VictoryChart>
    //             </Card>
    //         </View>
    //     );
    // };

    const onPressPagination = (targetIndex: number) => {
        ref.current?.scrollTo({
            count: targetIndex - carouselProgress,
            animated: true,
        });
    };
    const loading = loadingChart || loadingPeer;
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

                {/* <Carousel
                    width={CHART_W + 100}
                    height={CHART_H + 80}
                    data={Array.from({ length: MAX_WEEKS }, (_, i) => i)}
                    renderItem={renderChart}
                    autoPlay={false}
                    style={{ alignSelf: "center" }}
                    mode="parallax"
                    modeConfig={{
                        parallaxScrollingScale: 0.9,
                        parallaxScrollingOffset: 10,
                    }}
                    snapEnabled
                    defaultIndex={MAX_WEEKS - 1}
                    onSnapToItem={setCarouselIndex}
                    onProgressChange={(_, absoluteProgress) => {
                        setCarouselProgress(absoluteProgress);
                        progress.value = absoluteProgress;
                    }}
                />
                <Pagination.Basic
                    progress={progress}
                    data={data}
                    containerStyle={{ gap: 6, marginTop: -20 }}
                    dotStyle={{ width: 8, height: 8, borderRadius: 999, backgroundColor: "#C7D3D9" }}
                    activeDotStyle={{ width: 8, height: 8, borderRadius: 999, backgroundColor: Color.blue }}
                    onPress={onPressPagination}
                /> */}
                <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 10 }}>
                    {(["week", "month", "year"] as const).map((p) => (
                        <TouchableOpacity
                            key={p}
                            onPress={() => setPeriod(p)}
                            style={{
                                backgroundColor: p === period ? Color.blue : Color.white,
                                paddingVertical: 8,
                                paddingHorizontal: 16,
                                borderRadius: 12,
                                marginHorizontal: 6,
                            }}
                        >
                            <Text style={{ color: p === period ? Color.white : Color.blue, fontWeight: "bold" }}>
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
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
                                    title={`Games Played (${period})`}
                                    titleStyle={{ color: Color.gray, fontWeight: "bold", fontSize: 20 }}
                                />
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
                                    <VictoryLine
                                        data={peerSeries}
                                        style={{ data: { stroke: Color.green, strokeWidth: 3 } }}
                                    />
                                    <VictoryScatter
                                        data={peerSeries}
                                        size={5}
                                        style={{ data: { fill: Color.green } }}
                                        labels={({ datum }) => datum.y.toFixed(1)}
                                        labelComponent={<VictoryLabel dy={-10} style={{ fill: Color.green, fontSize: 12 }} />}
                                    />
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
                        <Text style={{ fontSize: Typography.header20.fontSize, fontWeight: Typography.header20.fontWeight, color: Color.gray }}>Overview statistcs for this week</Text>
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
                    {/* <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{
                            alignItems: "center",
                            paddingHorizontal: 10,
                        }}
                    >
                        {statCards.map((card) => (
                            <View key={card.key} style={{ height: "100%" }}>
                                {card.content}
                            </View>
                        ))}
                    </ScrollView> */}
                </View >
                <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-around", height: "70%" }}>
                    <Card style={{ width: "45%", height: "20%", backgroundColor: "#F2F8F9", padding: 10, justifyContent: "center", alignItems: "center" }}>
                        <View style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                            <Pencil width={50} height={50} />
                            <View style={{ display: "flex", flexDirection: "column" }}>
                                <Text style={{ fontWeight: "bold" }}>
                                    Words Learned
                                </Text>
                                <Text style={{ color: Color.gray }}>{wordsLearned && "error" in wordsLearned
                                    ? "Error"
                                    : wordsLearned && "wordsLearned" in wordsLearned
                                        ? `${wordsLearned.wordsLearned} Word(s)`
                                        : "0 Word(s)"}</Text>
                            </View>
                        </View>
                    </Card>
                    <Card style={{ width: "45%", height: "20%", backgroundColor: "#F2F8F9", padding: 10, justifyContent: "center", alignItems: "center" }}>
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
                        alignItems: "center",
                        justifyContent: "flex-start",
                        padding: 50,
                        height: "90%",
                        width: "70%"
                    }}
                >
                    {/* {loadingDaily ? (
                        <ActivityIndicator />
                    ) : dailyData ? (
                        <>
                            <View style={{ flexDirection: "row", width: "100%" }}>
                                <View style={{ flexDirection: "column", alignItems: "center", width: "100%" }}>
                                    <Text style={{ fontWeight: "bold", fontSize: 20, color: Color.gray, marginBottom: 5 }}>
                                        Average Games Played Weekly
                                    </Text>
                                    <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 10, color: Color.gray }}>
                                        {dailyData.weekLabel}
                                    </Text>
                                </View>
                                <IconButton
                                    icon={(p) => <CloseIcon width={18} height={18} fillColor={Color.gray} {...p} />}
                                    onPress={() => setModalVisible(false)}
                                    style={{ margin: 0 }}
                                    accessibilityLabel="Close dialog"
                                />
                            </View>
                            <View style={{
                                width: "20%", marginTop: 10, marginBottom: 20
                            }}>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>

                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <View style={{ width: 30, height: 4, backgroundColor: Color.blue, marginRight: 8, borderRadius: 2 }} />
                                    <Text style={{ marginRight: 20, color: Color.blue, fontWeight: "bold" }}>Your Games Played</Text>
                                </View>

                                <View style={{ flexDirection: "row", alignItems: "center" }}>

                                    <View style={{ width: 30, height: 4, backgroundColor: "#FFA500", marginRight: 8, borderRadius: 2 }} />
                                    <Text style={{ color: "#FFA500", fontWeight: "bold" }}>Average of Peers</Text>
                                </View>
                            </View>

                            {
                                (() => {
                                    try {
                                        return (
                                            <VictoryChart
                                                theme={VictoryTheme.material}
                                                height={CHART_H}
                                                domainPadding={{ x: [60, 40] }}
                                                domain={{ y: [0, modalMaxY + 2] }}
                                                padding={{ left: 65, right: 40, top: 40, bottom: 40 }}
                                            >
                                                <VictoryAxis
                                                    tickValues={modalTickValues}
                                                    style={{ tickLabels: { fontSize: 12, fill: Color.gray }, grid: { stroke: "#B5B5B5", strokeDasharray: "0" } }}
                                                />
                                                <VictoryAxis
                                                    dependentAxis
                                                    tickFormat={t => `${t}`}
                                                    style={{
                                                        grid: { stroke: "#B5B5B5", strokeDasharray: "0" },
                                                    }}
                                                />
                                                <VictoryBar
                                                    data={weeklySeries}
                                                    animate={{
                                                        duration: 1000,
                                                        onLoad: { duration: 800 },
                                                        onEnd: () => setBarAnimationDone(true),
                                                    }}
                                                    cornerRadius={5}
                                                    barWidth={25}
                                                    style={{
                                                        data: { fill: Color.blue, borderRadius: 6 },
                                                        labels: { fill: "#5B6073", fontSize: 15, fontWeight: "bold" },
                                                    }}
                                                    labels={({ datum }) => (barAnimationDone && datum.y !== 0 ? `${datum.y}` : "")}
                                                    labelComponent={<VictoryLabel dy={-8} textAnchor="middle" />}
                                                />
                                                <VictoryLine
                                                    key="line"
                                                    data={peerSeries}
                                                    style={{
                                                        data: { stroke: "#f8a958", strokeWidth: 4 },
                                                    }}
                                                />,
                                                <VictoryScatter
                                                    key="scatter"
                                                    data={peerSeries}
                                                    size={5}
                                                    style={{ data: { fill: "#f8a958" } }}
                                                    labels={({ datum }) =>
                                                        typeof datum.y === "number" ? datum.y.toFixed(1) : ""
                                                    }
                                                    labelComponent={
                                                        <VictoryLabel
                                                            dy={-10}
                                                            style={{ fill: "#f8a958", fontSize: 15, fontWeight: "bold" }}
                                                        />
                                                    }
                                                />,
                                            </VictoryChart>)
                                    } catch (e) {
                                        console.log("Chart error:", e);
                                        return <Text>Error rendering chart</Text>;
                                    }
                                })()
                            }
                        </>
                    ) : (
                        <Text>No data available</Text>
                    )
                    }
                    <View>

                    </View> */}
                    {loading ? (
                        <ActivityIndicator />
                    ) : isSuccess(TotalgamesData) && isSuccess(peerAvgData) ? (
                        <View style={{ width: "95%" }}>
                            <View style={{ flexDirection: "row" }}>
                                <View style={{ flexDirection: "column", alignItems: "center", width: "100%" }}>
                                    <Text style={{ fontWeight: "bold", fontSize: 20, color: Color.gray, marginBottom: 5 }}>
                                        Overview Statistics
                                    </Text>
                                    <Text style={{ fontWeight: "bold", fontSize: 16, color: Color.gray }}>
                                        {period.charAt(0).toUpperCase() + period.slice(1)}:{" "}
                                        {new Date(TotalgamesData.range.start).toLocaleDateString()} -{" "}
                                        {new Date(TotalgamesData.range.end).toLocaleDateString()}
                                    </Text>
                                </View>
                                <IconButton
                                    icon={(p) => <CloseIcon width={18} height={18} fillColor={Color.gray} {...p} />}
                                    onPress={() => setModalVisible(false)}
                                    style={{ margin: 0 }}
                                    accessibilityLabel="Close dialog"
                                />
                            </View>
                            <ScrollView horizontal={false}>
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