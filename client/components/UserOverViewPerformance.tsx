import React, { useEffect, useMemo, useRef, useState } from "react"
import { View, Text, ScrollView, Image } from "react-native"
import { useTotalGamesThisWeek, useAverageGamesByLevel, useUserTotalPlaytime, useUserWordLearned } from "@/hooks/useDashboard";
import Swiper from "react-native-swiper";
import { Color } from "@/theme/Color";
import { Card } from "react-native-paper";
import { ActivityIndicator } from "react-native";
import Clock from "@/assets/icon/Clock";
import Pencil from "@/assets/icon/Pencil";
import { VictoryAxis, VictoryBar, VictoryChart, VictoryLabel, VictoryLine, VictoryTheme } from "victory-native";

import { Dimensions } from "react-native";
import Carousel, { Pagination, ICarouselInstance } from "react-native-reanimated-carousel";
import { useSharedValue } from "react-native-reanimated";
import { Typography } from "@/theme/Font";
import NoGamePlayed from "@/assets/backgroundTheme/NoGamePlayed";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import ArrowLeft from "@/assets/icon/ArrowLeft";

const MAX_WEEKS = 5;
const UserOverviewPerformance = () => {
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [forceLoading, setForceLoading] = useState(true);
    const CHART_W = 550;
    const CHART_H = 300;
    const progress = useSharedValue<number>(0);
    const ref = useRef<ICarouselInstance>(null);
    useEffect(() => {
        const timer = setTimeout(() => setForceLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);
    const weekOffset = carouselIndex - (MAX_WEEKS - 1);
    const { data: TotalgamesData, isLoading: loadingChart, isError: chartError } = useTotalGamesThisWeek(weekOffset);
    const { data: avgGames, isLoading: avgLoading } = useAverageGamesByLevel(weekOffset);

    const counts = TotalgamesData?.counts ?? [0, 0, 0, 0, 0, 0, 0];
    const labels = TotalgamesData?.labels ?? ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const weekLabel = TotalgamesData?.weekLabel ?? "";
    const maxY = Math.max(1, ...counts);
    const showLoader = forceLoading || loadingChart || !TotalgamesData;
    const router = useRouter();


    const { data: totalPlaytime } = useUserTotalPlaytime();
    const { data: wordsLearned } = useUserWordLearned();

    const renderChart = () => {
        if (chartError) {
            return (
                <View style={{ width: CHART_W, height: CHART_H, justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ color: Color.gray }}>❌ Failed to load chart</Text>
                </View>
            );
        }

        if (showLoader) {
            return (
                <View style={{ width: CHART_W, height: CHART_H, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="small" />
                </View>
            );
        }
        const noGamePlayed = counts.every((c) => c === 0)
        const avgValue = avgGames && "averageGamesPlayedThisWeek" in avgGames
            ? avgGames.averageGamesPlayedThisWeek
            : 0;
        const avgCounts = labels.map(() => avgValue);
        if (noGamePlayed) {
            return (
                <View style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
                    <Card style={{
                        backgroundColor: "#F2F8F9", borderRadius: 16,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: CHART_W,
                        height: CHART_H + 80
                    }}>
                        <Card.Title
                            title={"📆 " + weekLabel}
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

            <Card style={{
                backgroundColor: "#F2F8F9", borderRadius: 16,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: CHART_W,

            }
            }>
                <Card.Title
                    title="Games Played"
                    subtitle={"📆 " + weekLabel}
                    titleStyle={{ color: Color.gray, fontWeight: "bold", fontSize: 25, textAlign: "center" }}
                    subtitleStyle={{ color: Color.gray, textAlign: "center", fontSize: 20 }}
                    style={{ alignItems: "center", paddingBottom: 0 }}
                />

                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                    <View style={{
                        width: 24,
                        height: 4,
                        backgroundColor: Color.pink,
                        borderRadius: 2,
                        marginRight: 8,
                        borderWidth: 1,
                        borderColor: Color.pink,
                        borderStyle: "dashed"
                    }} />
                    <Text style={{ color: Color.pink, fontWeight: "bold" }}>Average games played</Text>
                </View>
                <VictoryChart
                    theme={VictoryTheme.material}
                    width={CHART_W}
                    height={CHART_H}
                    // domainPadding={{ x: 22, y: 8 }}
                    domain={{ y: [0, maxY + 1] }}
                >
                    <VictoryAxis
                        dependentAxis
                        tickFormat={() => ""}
                        style={{
                            axis: { stroke: "transparent" },
                            ticks: { stroke: "transparent" },
                            grid: { stroke: "transparent" },
                        }}
                    />

                    <VictoryAxis
                        tickValues={[0, 1, 2, 3, 4, 5, 6]}
                        tickFormat={(t) => labels[t]}
                        style={{
                            tickLabels: { fontSize: 15, fill: "#5B6073" },
                            axis: { stroke: "transparent" },
                            ticks: { stroke: "transparent" },
                            grid: { stroke: "transparent" },
                        }}
                    />
                    <VictoryBar
                        data={counts.map((y, i) => ({ x: i, y }))}
                        barWidth={25}
                        style={{
                            data: { fill: Color.blue, borderRadius: 6 },
                            labels: { fill: "#5B6073", fontSize: 20, fontWeight: 600 },
                        }}
                        labels={({ datum }) => datum.y === 0 ? "" : `${datum.y}`}
                        labelComponent={<VictoryLabel dy={-8} textAnchor="middle" />}
                    />
                    <VictoryLine
                        data={avgCounts.map((y, i) => ({ x: i, y }))}
                        labels={({ index }) =>
                            index === avgCounts.length - 1 && avgGames?.averageGamesPlayedThisWeek
                                ? `Avg: ${avgGames.averageGamesPlayedThisWeek.toFixed(1)}`
                                : ""
                        }
                        labelComponent={
                            <VictoryLabel
                                dx={20} // move slightly right
                                dy={-10}
                                textAnchor="start"
                                style={{
                                    fill: Color.pink,
                                    fontSize: 14,
                                    fontWeight: "bold",
                                }}
                            />
                        }
                        style={{
                            data: {
                                stroke: Color.pink,
                                strokeWidth: 3,
                                strokeDasharray: "6,6",
                            },
                        }}
                    />
                </VictoryChart>
            </Card>
        )
    }
    const onPressPagination = (targetIndex: number) => {
        ref.current?.scrollTo({
            count: targetIndex - progress.value,
            animated: true,
        });
    };

    const data = Array.from({ length: MAX_WEEKS }, (_, i) => i);
    return (
        <View style={{ width: "50%", height: "100%", gap: 20 }}>
            <Card style={{ backgroundColor: "#E1F3F6", padding: 20 }}>
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
                    <Text style={{ color: Color.gray, fontSize: 20, fontWeight: "bold" }}>Dashboard and Analysis</Text>
                </View>
                <Carousel
                    width={CHART_W}
                    height={CHART_H + 60}
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
                    onProgressChange={progress}
                />
                <Pagination.Basic
                    progress={progress}
                    data={data}
                    containerStyle={{ paddingTop: 8, gap: 6 }}
                    dotStyle={{ width: 8, height: 8, borderRadius: 999, backgroundColor: "#C7D3D9" }}
                    activeDotStyle={{ width: 8, height: 8, borderRadius: 999, backgroundColor: Color.blue }}
                    onPress={onPressPagination}
                />
            </Card >
            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", height: "100%" }}>
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
    );
};

export default UserOverviewPerformance;