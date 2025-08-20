import React from "react"
import { View, Text } from "react-native"
import { useTotalGamesThisWeek, useUserTotalPlaytime, useUserWordLearned } from "@/hooks/useDashboard";
import {
    LineChart,
} from "react-native-chart-kit";
import Svg, { Text as SvgText } from "react-native-svg";
import { theme } from "@/theme";
import { Card } from "react-native-paper";
import Clock from "@/assets/icon/Clock";
import Pencil from "@/assets/icon/Pencil";


const UserOverviewPerformance = () => {

    const {
        data,
    } = useTotalGamesThisWeek();
    const maxValue = Math.max(...data?.counts ?? [1]);
    const segments = maxValue <= 6 ? maxValue : 5;
    const chartData = {
        labels: data?.labels ?? ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
        datasets: [{ data: data?.counts ?? [0, 0, 0, 0, 0, 0, 0] }],
    };
    const chartConfig = {
        backgroundColor: "#F2F8F9",
        backgroundGradientFrom: "#F2F8F9",
        backgroundGradientTo: "#F2F8F9",

        decimalPlaces: 0,
        color: () => `rgba(255, 214, 0)`,
        labelColor: () => `rgba(91, 96, 115)`,
        style: {
            borderRadius: 16,
        },
        propsForBackgroundLines: {
            stroke: theme.colors.darkGrey,
            strokeDasharray: "",
            strokeWidth: 0.5,
        },
    };

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
                }}>

                    <LineChart
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
                    />
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