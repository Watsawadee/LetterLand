import React, { useEffect, useState } from "react"
import { View, Text } from "react-native"
import { useTotalGamesThisWeek, useUserTotalPlaytime, useUserWordLearned } from "@/hooks/useDashboard";
import {
    BarChart,
} from "react-native-chart-kit";
import Svg, { Text as SvgText } from "react-native-svg";
import { theme } from "@/theme";
import { Card } from "react-native-paper";
import { ActivityIndicator } from "react-native";
import Clock from "@/assets/icon/Clock";
import Pencil from "@/assets/icon/Pencil";


const UserOverviewPerformance = () => {

    const { data: TotalgamesData, isLoading: loadingChart, isError: chartError } = useTotalGamesThisWeek();
    const [forceLoading, setForceLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setForceLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);



    //For custom segment
    const counts = TotalgamesData?.counts ?? [0, 0, 0, 0, 0, 0, 0];
    const labels = TotalgamesData?.labels ?? ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const rawMax = Math.max(...counts);
    const safeMax = Math.max(rawMax, 1);

    // Segments: show up to 6 lines, but at least 2
    const segments = Math.min(Math.max(safeMax, 1), 6);

    const chartData = {
        labels,
        datasets: [{ data: counts }],
    };

    //For UI mock up test
    // const chartData = {
    //     labels: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    //     datasets: [
    //         { data: [0, 0, 0, 0, 0, 0, 1] }
    //     ],
    // };

    const chartConfig = {
        backgroundColor: "#F2F8F9",
        backgroundGradientFrom: "#F2F8F9",
        backgroundGradientTo: "#F2F8F9",

        decimalPlaces: 0,
        color: () => `#000`,
        labelColor: () => `rgba(91, 96, 115)`,
        style: {
            borderRadius: 16,
        },
        propsForBackgroundLines: {
            strokeWidth: 0,
        },
    };

    const showLoader = forceLoading || loadingChart || !TotalgamesData;


    const { data: totalPlaytime, isLoading: loadingPlaytime } = useUserTotalPlaytime();
    const { data: wordsLearned, isLoading: loadingWords } = useUserWordLearned();

    // if (loadingPlaytime || loadingWords) return <Text>Loading...</Text>;

    return (
        <View style={{ gap: "2%" }}>
            <Card style={{ backgroundColor: "#E1F3F6", padding: 20 }}>
                <Text style={{ color: theme.colors.darkGrey, fontSize: theme.fontSizes.medium, fontWeight: "bold" }}>Total Games This Week</Text>
                <Text style={{ color: theme.colors.darkGrey, fontSize: theme.fontSizes.small }}>Total game play per week</Text>
                <View style={{
                    backgroundColor: "#F2F8F9", borderRadius: 16,
                    padding: 10,
                    margin: 12,
                    display: "flex",
                    justifyContent: "center"
                }}>
                    {
                        chartError ? (
                            <View style={{ height: 200, alignItems: "center", justifyContent: "center" }}>
                                <Text style={{ color: theme.colors.darkGrey }}>Failed to load chart</Text>
                            </View>) : showLoader ? (
                                <View style={{
                                    width: 450,
                                    height: 200,
                                    display: "flex",
                                    justifyContent: "center"
                                }}>
                                    <ActivityIndicator size={"small"} />
                                </View>
                            ) : (
                            <BarChart
                                data={chartData}
                                width={450}
                                height={200}
                                chartConfig={chartConfig}
                                fromZero={true}
                                yAxisLabel=""
                                yAxisSuffix=""
                                showValuesOnTopOfBars
                                segments={segments}
                                style={{
                                    borderRadius: 16,
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "flex-start",
                                    justifyContent: "flex-start"
                                }}
                            />
                        )
                    }

                    {/* <LineChart
                        data={chartData}
                        width={450}
                        height={200}
                        chartConfig={chartConfig}
                        bezier
                        fromZero={false}
                        segments={segments}
                        style={{
                            borderRadius: 16,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        }}
                        withVerticalLines={false}
                        withHorizontalLines={true}
                        decorator={({
                            width,
                            height,
                            data,
                        }: {
                            width: number;
                            height: number;
                            data: number[];
                        }) => {
                            const points = chartData.datasets[0].data;
                            const paddingLeft = 42;
                            const paddingRight = 64;
                            const chartHeight = height - 32;
                            const chartWidth = width - paddingLeft - paddingRight;
                            const maxValue = Math.max(...points, 1);

                            return (
                                <Svg>
                                    {points.map((value, index) => {
                                        if (value === 0) return null;
                                        const x =
                                            paddingLeft +
                                            (chartWidth / (points.length - 1)) * index;
                                        const y =
                                            height -
                                            (chartHeight * value) / maxValue;

                                        return (
                                            <SvgText
                                                key={index}
                                                x={x}
                                                y={y - 20}
                                                fontSize="10"
                                                fill={theme.colors.darkGrey}
                                                fontWeight="bold"
                                                textAnchor="end"
                                            >
                                                {value}
                                            </SvgText>
                                        );
                                    })}
                                </Svg>
                            );
                        }}
                    /> */}
                </View>
            </Card>

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