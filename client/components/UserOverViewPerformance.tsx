import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native"
import { useTotalGamesThisWeek, useAverageGamesByLevel, useUserTotalPlaytime, useUserWordLearned } from "@/hooks/useDashboard";
import Swiper from "react-native-swiper";
import { Color } from "@/theme/Color";
import { Card, Checkbox, IconButton, Modal, Portal } from "react-native-paper";
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
import { useAverageGamesEachDay } from "@/hooks/useAverageGameEachDay";
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
    const [selectedGraphs, setSelectedGraphs] = useState({
        games: true,
        peerAvg: false,
    });


    const toggleTimeout = useRef<NodeJS.Timeout | null>(null);

    const toggleGraph = useCallback(
        (key: "games" | "peerAvg") => {
            if (toggleTimeout.current) clearTimeout(toggleTimeout.current);

            toggleTimeout.current = setTimeout(() => {
                setSelectedGraphs(prev => ({
                    ...prev,
                    [key]: !prev[key],
                }));
            }, 200);
        },
        []
    );



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
    useEffect(() => {
        return () => {
            if (toggleTimeout.current) clearTimeout(toggleTimeout.current);
        };
    }, []);

    const weekOffset = carouselIndex - (MAX_WEEKS - 1);
    const { data: TotalgamesData, isLoading: loadingChart, isError: chartError } = useTotalGamesThisWeek(weekOffset);
    const { data: avgGames, isLoading: avgLoading } = useAverageGamesByLevel(weekOffset);
    const { data: dailyAvg, isLoading: loadingDaily } = useAverageGamesEachDay(weekOffset);
    const dailyData = dailyAvg
    const avgValue = avgGames && "averageGamesPlayedThisWeek" in avgGames
        ? Number(avgGames.averageGamesPlayedThisWeek).toFixed(2)
        : "0.00";

    const counts = TotalgamesData?.counts ?? [0, 0, 0, 0, 0, 0, 0];
    const labels = TotalgamesData?.labels ?? ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const weekLabel = TotalgamesData?.weekLabel ?? "";
    const weeklySeries = useMemo(
        () =>
            labels.map((label, index) => ({
                x: label,
                y: typeof counts[index] === "number" ? counts[index] : 0,
            })),
        [labels, counts]
    );

    const peerSeries = useMemo(() => {
        if (!dailyData?.labels || !dailyData?.counts) {
            return [];
        }
        return dailyData.labels.map((label, index) => {
            const value = dailyData.counts[index];
            return {
                x: label,
                y: typeof value === "number" && Number.isFinite(value) ? value : 0,
            };
        });
    }, [dailyData]);

    const modalTickValues = useMemo(() => {
        const set = new Set<string>();
        weeklySeries.forEach(point => set.add(String(point.x)));
        peerSeries.forEach(point => set.add(String(point.x)));
        return Array.from(set);
    }, [peerSeries, weeklySeries]);

    const modalMaxY = useMemo(() => {
        const userMax = weeklySeries.reduce((max, point) => Math.max(max, point.y ?? 0), 0);
        const peerMax = peerSeries.reduce((max, point) => Math.max(max, point.y ?? 0), 0);
        return Math.max(1, userMax, peerMax);
    }, [peerSeries, weeklySeries]);

    const maxY = Math.max(1, ...counts);
    const router = useRouter();


    const { data: totalPlaytime } = useUserTotalPlaytime();
    const { data: wordsLearned } = useUserWordLearned();

    function getLongestStreak(counts: number[]): number {
        let maxStreak = 0;
        let currentStreak = 0;
        for (let i = 0; i < counts.length; i++) {
            if (counts[i] > 0) {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else {
                currentStreak = 0;
            }
        }
        return maxStreak;
    }
    function isValidArray(arr1: number[] | undefined, arr2: number[] | undefined): boolean {
        return Array.isArray(arr1) && Array.isArray(arr2) && arr1.length === arr2.length && arr1.length > 0;
    }

    function getWeekLabels(startDateStr: string) {
        const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
        const startDate = new Date(startDateStr);
        const startIdx = startDate.getUTCDay(); // 0=Sun, 6=Sat
        return Array.from({ length: 7 }, (_, i) => days[(startIdx + i) % 7]);
    }

    // Usage in your statCards:
    const longestStreak = getLongestStreak(counts);

    const statCards = [
        {
            key: "peak",
            content: (
                <Card style={{ backgroundColor: "#F2F8F9", padding: 16, borderRadius: 16, alignItems: "center", justifyContent: "center", width: 250, minHeight: 100, marginHorizontal: 8 }}>
                    <Text style={{ fontWeight: "bold", color: Color.black }}>Peak Learning Day</Text>
                    <Text style={{ color: Color.blue, fontSize: 18, fontWeight: "bold" }}>
                        {labels[counts.indexOf(Math.max(...counts))]} — {Math.max(...counts)} games
                    </Text>
                    <Text style={{ color: Color.black }}>You’re most active on this day!</Text>
                </Card>
            ),
        },
        {
            key: "avg",
            content: (
                <Card style={{ backgroundColor: "#F2F8F9", padding: 16, borderRadius: 16, alignItems: "center", justifyContent: "center", width: 250, minHeight: 100, marginHorizontal: 8 }}>
                    <Text style={{ color: Color.black, fontWeight: "bold", fontSize: 16 }}>
                        Average games played by all users this week:{" "}
                        <Text style={{ color: Color.blue, fontWeight: "bold", fontSize: 18 }}>{avgValue}</Text>
                    </Text>
                </Card>
            ),
        },
        {
            key: "level",
            content: (
                <Card style={{ backgroundColor: "#F2F8F9", padding: 16, borderRadius: 16, alignItems: "center", justifyContent: "center", width: 250, minHeight: 100, marginHorizontal: 8 }}>
                    <Text style={{ fontWeight: "bold", color: Color.black }}>
                        English Level: <Text style={{ color: Color.black }}>{dailyData?.englishLevel}</Text>
                    </Text>
                    <Text style={{ color: Color.blue, fontWeight: "bold" }}>
                        {dailyData?.userCount} peers in this level
                    </Text>
                </Card>
            ),
        },
        {
            key: "streak",
            content: (
                <Card style={{ backgroundColor: "#F2F8F9", padding: 16, borderRadius: 16, alignItems: "center", justifyContent: "center", width: 250, minHeight: 100, marginHorizontal: 8 }}>
                    <Text style={{ color: Color.black, fontWeight: "bold" }}>Longest Streak of this week</Text>
                    <Text style={{ color: Color.blue, fontSize: 18, fontWeight: "bold" }}>
                        {longestStreak} {longestStreak === 1 ? "day" : "days"}
                    </Text>
                </Card>
            ),
        },
    ];
    const renderChart = ({ index }: { index: number }) => {
        const weekOffset = index - (MAX_WEEKS - 1);
        const { data: TotalgamesData, isLoading: loadingChart, isError: chartError } = useTotalGamesThisWeek(weekOffset);

        if (chartError) {
            return (
                <View style={{ width: CHART_W, height: CHART_H, justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ color: Color.gray }}>❌ Failed to load chart</Text>
                </View>
            );
        }

        if (loadingChart || !TotalgamesData) {
            return (
                <View style={{ width: CHART_W, height: CHART_H, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="large" />
                </View>
            );
        }

        const counts = TotalgamesData.counts ?? [0, 0, 0, 0, 0, 0, 0];
        const labels = TotalgamesData.range
            ? getWeekLabels(TotalgamesData.range.start)
            : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
        const weekLabel = TotalgamesData.weekLabel ?? "";
        const maxY = Math.max(1, ...counts);
        const noGamePlayed = counts.every((c) => c === 0);

        if (noGamePlayed) {
            return (
                <View style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
                    <Card style={{
                        backgroundColor: Color.white, borderRadius: 16,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                        height: "100%",
                    }}>
                        <Card.Title
                            title={weekLabel}
                            titleStyle={{ color: Color.gray, textAlign: "center", fontSize: 20 }}
                            style={{ alignItems: "center", paddingBottom: 0 }}
                        />
                        <Text style={{ color: Color.grey, fontWeight: "bold", fontSize: 20, textAlign: "center" }}>
                            No games played this week!
                        </Text>
                        <NoGamePlayed />
                    </Card>
                </View>
            )
        }
        return (
            <View style={{ flex: 1 }}>

                <Card style={{
                    backgroundColor: Color.white, borderRadius: 16,
                    overflow: "visible",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    height: "100%",
                    padding: 25

                }
                }>
                    <Card.Title
                        title={!("error" in TotalgamesData) && TotalgamesData?.range
                            ? (() => {
                                return TotalgamesData.offSet === 0
                                    ? `This week detail (${weekLabel})`
                                    : `${weekLabel}`;
                            })()
                            : "Week unavailable"
                        }
                        subtitle="Total game play per week"
                        titleStyle={{ color: Color.gray, fontWeight: "bold", fontSize: 25, textAlign: "left" }}
                        subtitleStyle={{ color: Color.gray, textAlign: "left", fontSize: 20 }}
                        style={{ justifyContent: "flex-start", width: "100%", paddingBottom: 0 }}
                    />

                    <VictoryChart
                        theme={VictoryTheme.material}
                        width={CHART_W}
                        height={CHART_H - 30}
                        domainPadding={{ x: [30, 40] }}
                        domain={{ y: [0, maxY + 2] }}
                    >
                        <VictoryAxis
                            dependentAxis
                            tickFormat={(t) => `${t}`}
                            style={{
                                grid: { stroke: "#B5B5B5", strokeDasharray: "0" },
                                axis: { stroke: "transparent" }
                            }}
                        />

                        <VictoryAxis
                            tickValues={labels}
                            tickFormat={(t) => t}
                            style={{
                                tickLabels: { fontSize: 15, fill: Color.gray },
                                grid: { stroke: "transparent" },
                                ticks: { stroke: "transparent" }
                            }}
                        />

                        <VictoryBar
                            data={labels.map((label, i) => ({ x: label, y: counts[i] }))}
                            barWidth={52}
                            cornerRadius={5}
                            style={{
                                data: { fill: Color.blue, borderRadius: 6 },
                                labels: { fill: "#5B6073", fontSize: 20, fontWeight: 600 },
                            }}
                            labels={({ datum }) => (datum.y === 0 ? "" : `${datum.y}`)}
                            labelComponent={<VictoryLabel dy={-8} textAnchor="middle" />}
                        />
                    </VictoryChart>
                    <Pressable
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                        }}
                        onLongPress={() => {
                            console.log("Chart Press Detected");
                            setModalVisible(true);
                        }}
                    />
                </Card >
            </View>

        )
    }

    const onPressPagination = (targetIndex: number) => {
        ref.current?.scrollTo({
            count: targetIndex - carouselProgress,
            animated: true,
        });
    };

    const data = Array.from({ length: MAX_WEEKS }, (_, i) => i);
    return (
        <>
            <View style={{ width: "68%", height: "100%", gap: 23 }}>
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

                <Carousel
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
                />
                <View
                    style={{
                        width: "100%",
                        height: "15%",
                        alignSelf: "center",
                        marginTop: 5,
                    }}
                >
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{
                            alignItems: "center",
                            paddingHorizontal: 10,
                        }}
                    >
                        {statCards.map((card) => (
                            <View key={card.key} style={{ marginHorizontal: GAP / 2 }}>
                                {card.content}
                            </View>
                        ))}
                    </ScrollView>
                </View>
                <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", height: "70%" }}>
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
                            <View style={{ display: "flex", flexDirection: "column" }}>
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
            <Portal>
                <Modal
                    visible={modalVisible}
                    onDismiss={() => setModalVisible(false)}
                    contentContainerStyle={{
                        backgroundColor: Color.white,
                        margin: 20,
                        borderRadius: 16,
                        alignItems: "center",
                        justifyContent: "flex-start",
                        padding: 50,
                        height: "80%",
                    }}
                >

                    {loadingDaily ? (
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
                            <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 20 }}>
                                {[
                                    { key: "games", label: "Games Played", color: Color.blue },
                                    { key: "peerAvg", label: "Average of Peer", color: "#FFB300" },
                                ].map(opt => (
                                    <TouchableOpacity
                                        key={opt.key}
                                        disabled={loadingDaily || loadingChart}
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            marginHorizontal: 10,
                                            paddingVertical: 8,
                                            paddingHorizontal: 12,
                                            borderRadius: 20,
                                            backgroundColor: selectedGraphs[opt.key as keyof typeof selectedGraphs] ? opt.color : Color.gray,
                                        }}
                                        onPress={() => toggleGraph(opt.key as "games" | "peerAvg")}
                                    >
                                        <Checkbox.Android
                                            status={selectedGraphs[opt.key as keyof typeof selectedGraphs] ? "checked" : "unchecked"}
                                            onPress={() => toggleGraph(opt.key as "games" | "peerAvg")}
                                            color="#fff"
                                        // disabled={loadingDaily || loadingChart}
                                        />
                                        <Text style={{ color: "#fff", fontWeight: "bold" }}>{opt.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                                {/* {selectedGraphs.games && labels && counts && labels.length === counts.length && ( */}
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <View style={{ width: 30, height: 4, backgroundColor: Color.blue, marginRight: 8, borderRadius: 2 }} />
                                    <Text style={{ marginRight: 20, color: Color.blue, fontWeight: "bold" }}>Your Games Played</Text>
                                </View>
                                {/* )} */}
                                {/* {selectedGraphs.peerAvg && labels && dailyData?.counts && labels.length === dailyData.counts.length && ( */}
                                <View style={{ flexDirection: "row", alignItems: "center" }}>

                                    <View style={{ width: 30, height: 4, backgroundColor: "#FFA500", marginRight: 8, borderRadius: 2 }} />
                                    <Text style={{ color: "#FFA500", fontWeight: "bold" }}>Average of Peers</Text>
                                </View>
                                {/* )} */}
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
                                                {selectedGraphs.games && (
                                                    <VictoryBar
                                                        data={weeklySeries}
                                                        cornerRadius={5}
                                                        barWidth={25}
                                                        style={{
                                                            data: { fill: Color.blue, borderRadius: 6 },
                                                            labels: { fill: "#5B6073", fontSize: 15, fontWeight: "bold" },
                                                        }}
                                                        labels={({ datum }) => (datum.y === 0 ? "" : `${datum.y}`)}
                                                        labelComponent={<VictoryLabel dy={-8} textAnchor="middle" />}
                                                    />
                                                )}
                                                {selectedGraphs.peerAvg && peerSeries.length > 0 && [
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
                                                ]}
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

                </Modal >
            </Portal >
        </>
    );
};

export default UserOverviewPerformance;