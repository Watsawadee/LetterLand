import React, { useEffect, useMemo, useRef, useState } from "react"
import { View, Text, ScrollView } from "react-native"
import { useTotalGamesThisWeek, useUserTotalPlaytime, useUserWordLearned } from "@/hooks/useDashboard";
import Swiper from "react-native-swiper";
import { theme } from "@/theme";
import { Card } from "react-native-paper";
import { ActivityIndicator } from "react-native";
import Clock from "@/assets/icon/Clock";
import Pencil from "@/assets/icon/Pencil";
import { VictoryAxis, VictoryBar, VictoryChart, VictoryLabel, VictoryTheme } from "victory-native";
import { Dimensions } from "react-native";
import Carousel, { Pagination, ICarouselInstance } from "react-native-reanimated-carousel";
import { useSharedValue } from "react-native-reanimated";

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

    const counts = TotalgamesData?.counts ?? [0, 0, 0, 0, 0, 0, 0];
    const labels = TotalgamesData?.labels ?? ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const weekLabel = TotalgamesData?.weekLabel ?? "";
    const maxY = Math.max(1, ...counts);
    const showLoader = forceLoading || loadingChart || !TotalgamesData;

    const { data: totalPlaytime } = useUserTotalPlaytime();
    const { data: wordsLearned } = useUserWordLearned();

    const renderChart = () => {
        if (chartError) {
            return (
                <View style={{ width: CHART_W, height: CHART_H, justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ color: theme.colors.darkGrey }}>❌ Failed to load chart</Text>
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
        return (

            <Card style={{
                backgroundColor: "#F2F8F9", borderRadius: 16,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: CHART_W

            }
            }>
                <Card.Title
                    title="Games Played"
                    subtitle={weekLabel}
                    titleStyle={{ color: theme.colors.darkGrey, fontWeight: "bold", fontSize: 25, textAlign: "center" }}
                    subtitleStyle={{ color: theme.colors.darkGrey, textAlign: "center" }}
                    style={{ alignItems: "center", paddingBottom: 0 }}
                />

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
                            data: { fill: theme.colors.blue, borderRadius: 6 },
                            labels: { fill: "#5B6073", fontSize: 20, fontWeight: 600 },
                        }}
                        labels={({ datum }) => datum.y === 0 ? "" : `${datum.y}`}
                        labelComponent={<VictoryLabel dy={-8} textAnchor="middle" />}
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
                <Text style={{ color: theme.colors.darkGrey, fontSize: theme.fontSizes.medium, fontWeight: "bold" }}>Dashboard and Analysis</Text>
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
                    activeDotStyle={{ width: 8, height: 8, borderRadius: 999, backgroundColor: theme.colors.blue }}
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
                            <Text style={{ color: theme.colors.darkGrey }}>{wordsLearned && "error" in wordsLearned
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
                            <Text style={{ color: theme.colors.darkGrey }}> {totalPlaytime && "error" in totalPlaytime
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