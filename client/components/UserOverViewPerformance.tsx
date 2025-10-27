import React, { useEffect, useMemo, useRef, useState } from "react"
import { View, Text, ScrollView, Image, TouchableOpacity, Platform } from "react-native"
import { usePeerAverageGamesPerPeriod, useUserTotalPlaytime, useUserWordLearned, useUserGameStreak, useUserProgress, useTotalGamesMultiplePeriod } from "@/hooks/useDashboard";
import { Color } from "@/theme/Color";
import { Button, Card, Checkbox, IconButton, List, Modal, PaperProvider, Portal } from "react-native-paper";
import { ActivityIndicator } from "react-native";
import Clock from "@/assets/icon/Clock";
import Pencil from "@/assets/icon/Pencil";
import {
    Axis,
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
import { addDays, addMonths, addWeeks, addYears, endOfMonth, endOfWeek, endOfYear, format, startOfMonth, startOfWeek, startOfYear, subMonths, subWeeks, subYears } from "date-fns";
import { useColorScheme } from "react-native";
import { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { FloatingBubble } from "@/assets/images/bubblePopup";
import BoxingGlove from "@/assets/icon/BoxingGlove";
import Fire from "@/assets/icon/Fire";
import Trophy from "@/assets/icon/Trophy";
import { ColorProperties } from "react-native-reanimated/lib/typescript/Colors";
import Carousel from "react-native-reanimated-carousel";
import { AverageGamesByLevelPeerMultipleOrError } from "@/libs/type";

function getWeekDates(startDateStr: string, labels: string[]) {
    const startDate = new Date(startDateStr);
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return labels.map((label, i) => {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        return {
            label: weekDays[d.getDay()], // always 3-letter format
            date: `${d.getDate()} ${d.toLocaleString("en-GB", { month: "short" })}`,
        };
    });
}

function getMonthWeekRanges(startDateStr: string, labels: string[]) {
    const startDate = startOfMonth(new Date(startDateStr));
    const endDate = endOfMonth(startDate);
    const weeks = [];
    let current = new Date(startDate);
    let weekNum = 1;

    while (current <= endDate) {
        const weekStart = new Date(current);
        let weekEnd = addDays(weekStart, 6);

        // ⛔ Clamp weekEnd so it never goes beyond this month
        if (weekEnd > endDate) {
            weekEnd = new Date(endDate);
        }

        weeks.push({
            label: `Week ${weekNum}`,
            range: `${weekStart.getDate()} ${weekStart.toLocaleString("en-GB", {
                month: "short",
            })}–${weekEnd.getDate()} ${weekEnd.toLocaleString("en-GB", {
                month: "short",
            })}`,
        });

        // Move to next week (weekEnd + 1 day)
        current = addDays(weekEnd, 1);
        weekNum++;
    }

    return weeks.slice(0, labels.length);
}
const UserOverviewPerformance = () => {
    const [forceLoading, setForceLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [showBook, setShowBook] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [tempDate, setTempDate] = useState<Date>(new Date());
    const [monthRange, setMonthRange] = useState<{ start: Date; end: Date } | null>(null);
    const [period, setPeriod] = useState<"week" | "month" | "year">("week");
    const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);

    useEffect(() => {
        const today = new Date();
        const s = startOfWeek(today, { weekStartsOn: 0 });
        const e = endOfWeek(today, { weekStartsOn: 0 });
        setSelectedDate(today);
        setMonthRange({ start: s, end: e });
    }, []);
    const formattedEndDate = monthRange
        ? monthRange.end.toISOString().split("T")[0]
        : selectedDate.toISOString().split("T")[0];

    const formatDateRange = (
        startStr: string,
        endStr: string,
        p: "week" | "month" | "year"
    ) => {
        const start = new Date(startStr);
        const end = new Date(endStr);
        const startFormatted = start.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            timeZone: "UTC",
        });
        const endFormatted = end.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            timeZone: "UTC",
        });

        if (p === "week" || (p === "month" && start.getUTCMonth() === end.getUTCMonth() && start.getUTCFullYear() === end.getUTCFullYear())) {
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



    const CHART_W = 750;
    const CHART_H = 300;


    useEffect(() => {
        const timer = setTimeout(() => setForceLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);








    const { data: gamesData, isLoading: loadingChart } = useTotalGamesMultiplePeriod(
        period,
        formattedEndDate
    );
    const today = new Date();
    const sortedResults = isSuccess(gamesData)
        ? [...gamesData.results]
            .filter((r) => new Date(r.range.start) <= today)
            .sort((a, b) => new Date(a.range.start).getTime() - new Date(b.range.start).getTime())
        : [];
    useEffect(() => {
        if (period === "week") {
            const t = new Date();
            const s = startOfWeek(t, { weekStartsOn: 0 });
            const e = endOfWeek(t, { weekStartsOn: 0 });

            const currentStartISO = monthRange?.start.toISOString().split("T")[0];
            const targetStartISO = s.toISOString().split("T")[0];

            if (currentStartISO !== targetStartISO) {
                setSelectedDate(t);
                setMonthRange({ start: s, end: e });
            }
        }
    }, [period]);
    useEffect(() => {
        if (sortedResults.length === 0) return;
        const latest = sortedResults[sortedResults.length - 1];
        const latestEndISO = new Date(latest.range.end).toISOString().split("T")[0];
        const currentEndISO = monthRange?.end.toISOString().split("T")[0];

        if (latestEndISO && currentEndISO && latestEndISO !== currentEndISO && period === "week") {
            setSelectedDate(new Date(latest.range.end));
            setMonthRange({ start: new Date(latest.range.start), end: new Date(latest.range.end) });
        }
    }, [JSON.stringify(sortedResults.map((r) => r.range)), period]);

    const initialIndex = sortedResults.length > 0 ? sortedResults.length - 1 : 0;
    const [activeIndex, setActiveIndex] = useState(initialIndex);
    useEffect(() => {
        setActiveIndex(sortedResults.length > 0 ? sortedResults.length - 1 : 0);
    }, [sortedResults.length]);

    const { data: peerAvgData, isLoading: loadingPeer } = usePeerAverageGamesPerPeriod(
        period,
        formattedEndDate
    )
    const { data: totalPlaytime } = useUserTotalPlaytime();
    const { data: wordsLearned } = useUserWordLearned();
    const { data: streakData } = useUserGameStreak();

    const getPeriodLabel = (p: "week" | "month" | "year") => {
        switch (p) {
            case "week":
                return "Weekly Activity";
            case "month":
                return "Monthly Activity";
            case "year":
                return "Yearly Activity";
        }
    };

    const currentPeriod = isSuccess(gamesData)
        ? gamesData.results[gamesData.results.length - 1]
        : undefined;


    useEffect(() => {
        if (isSuccess(gamesData) && sortedResults.length > 0) {
            const latestPeriod = sortedResults[sortedResults.length - 1];
            const currentEnd = monthRange?.end.toISOString().split("T")[0];
            const latestEnd = new Date(latestPeriod.range.end).toISOString().split("T")[0];

            if (currentEnd !== latestEnd) {
                console.log("📅 Setting latest period to:", latestPeriod.range.start, latestPeriod.range.end);
                setSelectedDate(new Date(latestPeriod.range.end));
                setMonthRange({
                    start: new Date(latestPeriod.range.start),
                    end: new Date(latestPeriod.range.end),
                });
            }
        }
    }, [gamesData]);


    useEffect(() => {
        console.log("gamesData", gamesData);
        console.log("peerAvgData", peerAvgData);
    }, [gamesData, peerAvgData]);

    const weekTickLabels = gamesData && gamesData.results && currentPeriod && currentPeriod.period === "week"
        ? getWeekDates(currentPeriod.range.start, currentPeriod.labels)
        : [];

    const monthTickLabels = gamesData && gamesData.results && currentPeriod && currentPeriod.period === "month"
        ? getMonthWeekRanges(currentPeriod.range.start, currentPeriod.labels)
        : [];


    const streakCards = [
        {
            label: "Longest Streak Ever",
            value: streakData && "allTime" in streakData ? streakData.allTime : "-",
            icon: Trophy,
        },
        {
            label: "Ongoing Streak in This Level",
            value: streakData && "currentLevel" in streakData ? streakData.currentLevel : "-",
            icon: Fire,
        },
        {
            label: "Top Streak in Your Level",
            value: streakData && "highestStreakInThisLevel" in streakData ? streakData.highestStreakInThisLevel : "-",
            icon: BoxingGlove
        },
    ];
    function isSuccess<T extends { results?: unknown }>(
        data: T | { error: string } | undefined
    ): data is T & { results: unknown[] } {
        return !!data && Array.isArray((data as any).results);
    }
    const activePeriodData = sortedResults[activeIndex];


    const router = useRouter();
    const loading = loadingChart || loadingPeer;
    const renderPeriodChart = (item: any, peerItem?: any) => {
        const periodSeries = item.labels.map((label: string, i: number) => ({
            x: label,
            y: item.counts[i],
        }));
        const peerSeries = peerItem
            ? peerItem.labels.map((label: string, i: number) => ({
                x: label,
                y: peerItem.counts[i],
            }))
            : [];
        const maxY = Math.max(1, ...item.counts);

        // Generate tick labels for this period
        const weekTickLabels = item.period === "week"
            ? getWeekDates(item.range.start, item.labels)
            : [];
        const monthTickLabels = item.period === "month"
            ? getMonthWeekRanges(item.range.start, item.labels)
            : [];

        return (
            <View style={{ paddingHorizontal: 25 }}>
                <VictoryChart
                    theme={VictoryTheme.material}
                    width={CHART_W - 20}
                    height={CHART_H}
                    domainPadding={{ x: [30, 50] }}
                    domain={{ y: [0, maxY + 2] }}
                >
                    <VictoryAxis
                        tickValues={currentPeriod?.labels}
                        tickLabelComponent={
                            <VictoryLabel
                                text={({ index }) => {
                                    const safeIndex = typeof index === "number" ? index : 0;
                                    if (item.period === "week") {
                                        if (!weekTickLabels[safeIndex]) {
                                            return item.labels[safeIndex];
                                        }
                                        return `${weekTickLabels[safeIndex].label}\n${weekTickLabels[safeIndex].date}`;
                                    } else if (item.period === "month") {
                                        if (!monthTickLabels[safeIndex]) {
                                            return item.labels[safeIndex];
                                        }
                                        return `${monthTickLabels[safeIndex].label}\n${monthTickLabels[safeIndex].range}`;
                                    }
                                    return item.labels[safeIndex];
                                }}
                                style={[
                                    {
                                        fontSize: 12, fill: Color.gray, fontWeight: "bold", fontFamily: Platform.select({
                                            default: "System",
                                        }),
                                    },
                                    {
                                        fontSize: 10, fill: Color.gray, fontFamily: Platform.select({
                                            default: "System",
                                        }),
                                    }
                                ]}
                                lineHeight={[1, 1]}
                            />
                        }
                        style={{
                            tickLabels: { fontSize: 12, fill: Color.blue }, grid: {
                                stroke: "transparent",
                                strokeWidth: 1.5,
                                strokeDasharray: 0.5,
                            },
                        }}
                    />
                    <VictoryAxis dependentAxis style={{
                        axis: { stroke: "transparent", strokeWidth: 1.5 }, ticks: { stroke: "transparent" }, tickLabels: {
                            fill: Color.gray,
                            fontSize: 12,
                            fontWeight: "500",
                        }, grid: {
                            stroke: "#B5B5B5",
                            strokeWidth: 1.5,
                            strokeDasharray: 0.5,
                        },
                    }}
                    />



                    {/* <Defs>
                                            <LinearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                <Stop offset="0%" stopColor={Color.blue} />
                                                <Stop offset="100%" stopColor="#4584ccff" />
                                            </LinearGradient>
                                        </Defs> */}
                    <VictoryBar
                        data={periodSeries}
                        barWidth={40}
                        cornerRadius={10}
                        style={{
                            // data: { fill: "url(#barGradient)" }
                            data: { fill: Color.blue, zIndex: 0 },

                        }}
                        labels={({ datum }) => `${datum.y}\n games`}
                        labelComponent={
                            <VictoryTooltip flyoutStyle={{ fill: "#fff", stroke: Color.blue, strokeWidth: 1, }}
                                style={{
                                    fill: Color.blue, fontWeight: "600", fontSize: 13, textAlign: "center", zIndex: 3
                                }}
                                flyoutPadding={{ top: 8, bottom: 8, left: 10, right: 10 }}
                                dy={-10}
                                pointerLength={0}
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
                    />
                    {peerSeries.length > 0 && peerSeries.some((d: any) => d.y !== 0) && ([
                        <VictoryLine
                            data={peerSeries}
                            style={{ data: { stroke: Color.green, strokeWidth: 3, zIndex: 10, } }}
                            events={[
                                {
                                    target: "data",
                                    eventHandlers: {
                                        onPressIn: () => false,
                                    },
                                },
                            ]}

                        />,
                        <VictoryScatter
                            data={peerSeries}
                            size={5}
                            style={{ data: { fill: Color.green, pointerEvents: "none" as any } }}
                            labels={({ datum }) => datum.y.toFixed(1)}
                            labelComponent={<VictoryLabel dy={-10} style={{ fill: Color.green, fontSize: 12, stroke: Color.green, strokeWidth: 1 }} />}
                            events={[
                                {
                                    target: "data",
                                    eventHandlers: {
                                        onPressIn: () => false,
                                    },
                                },
                            ]}
                        />
                    ])}

                    {/* {peerSeries.length > 0 && peerSeries.some((d: any) => d.y !== 0) && ([
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
                ])} */}

                </VictoryChart>
            </View>
        );
    };

    return (
        <View style={{ width: "100%", height: "100%", gap: 15 }}>
            {(loading || !isSuccess(gamesData) || sortedResults.length === 0) ? (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="large" color={Color.blue} />
                    <Text style={{ color: Color.gray, marginTop: 8, fontWeight: "600" }}>
                        Loading dashboard...
                    </Text>
                </View>
            ) : (
                <>
                    <View style={{ width: "100%", height: "100%", gap: 15 }}>
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
                                    <ArrowLeft width={24} height={24} color={Color.gray} />
                                </Pressable>
                                <Text style={[Typography.header30, { color: Color.gray, marginLeft: 4 }]}>
                                    Dashboard
                                </Text>
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
                                    ) : isSuccess(gamesData) && isSuccess(peerAvgData) ? (
                                        <Card
                                            style={{
                                                backgroundColor: Color.white,
                                                borderRadius: 16,
                                                padding: 20,
                                                width: "93%",
                                                position: "relative",
                                                overflow: "hidden",
                                            }}
                                        >
                                            <View style={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                                                <Text
                                                    style={{
                                                        color: Color.gray,
                                                        fontWeight: "bold",
                                                        fontSize: 20,
                                                    }}
                                                >
                                                    {getPeriodLabel(period)}
                                                </Text>

                                                <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                                                    {(["week", "month", "year"] as const).map((p) => {
                                                        const isSelected = p === period;
                                                        return (
                                                            <Button
                                                                key={p}
                                                                onPress={() => {
                                                                    setPeriod(p);
                                                                    setShowPicker(true);
                                                                    setTempDate(selectedDate);
                                                                }}
                                                                style={{
                                                                    backgroundColor: isSelected ? Color.blue : Color.white,
                                                                    borderColor: Color.blue,
                                                                    borderWidth: 1.5,
                                                                    paddingHorizontal: 10,
                                                                    borderRadius: 10,
                                                                    marginHorizontal: 6,
                                                                    height: 38,
                                                                    justifyContent: "center",
                                                                }}
                                                                rippleColor={"transparent"}
                                                            >
                                                                <Text
                                                                    style={{
                                                                        color: isSelected ? Color.white : Color.gray,
                                                                        fontSize: 14,
                                                                        fontWeight: "bold"
                                                                    }}
                                                                >
                                                                    {p.charAt(0).toUpperCase() + p.slice(1)}
                                                                </Text>
                                                            </Button>
                                                        );
                                                    })}
                                                </View>

                                            </View>
                                            <Text
                                                style={{
                                                    color: "#9AAAB4",
                                                    fontWeight: "bold",
                                                    fontSize: 13,
                                                    marginBottom: 10,
                                                }}
                                            >
                                                {sortedResults.length > 0 && sortedResults[activeIndex]
                                                    ? formatDateRange(
                                                        sortedResults[activeIndex].range.start,
                                                        sortedResults[activeIndex].range.end,
                                                        period
                                                    )
                                                    : "Games Played"}

                                            </Text>
                                            {/* <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
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
                                    </View> */}


                                            {loadingChart || loadingPeer ? (
                                                <View style={{ height: CHART_H, justifyContent: "center", alignItems: "center" }}>
                                                    <ActivityIndicator size="large" color={Color.blue} />
                                                    <Text style={{ color: Color.gray, marginTop: 8, fontWeight: "600" }}>
                                                        Loading chart data...
                                                    </Text>
                                                </View>
                                            ) : isSuccess(gamesData) && gamesData.results.length > 0 ? (
                                                <Carousel
                                                    width={CHART_W}
                                                    height={CHART_H}
                                                    data={sortedResults}
                                                    defaultIndex={initialIndex}
                                                    onSnapToItem={setActiveIndex}
                                                    renderItem={({ item }) => {
                                                        let peerItem = undefined;

                                                        if (isSuccess(peerAvgData)) {
                                                            peerItem = peerAvgData.results.find((p: any) => {
                                                                const startA = new Date(p.range.start);
                                                                const endA = new Date(p.range.end);
                                                                const startB = new Date(item.range.start);
                                                                const endB = new Date(item.range.end);

                                                                return (
                                                                    p.period === item.period &&
                                                                    startA.getTime() <= endB.getTime() &&
                                                                    endA.getTime() >= startB.getTime()
                                                                );
                                                            });
                                                        }

                                                        return renderPeriodChart(item, peerItem);
                                                    }}
                                                    style={{ alignSelf: "center" }}
                                                    loop={false}
                                                />
                                            ) : loadingChart ? (
                                                <ActivityIndicator size="large" />
                                            ) : (
                                                <Text style={{ color: Color.gray }}>No chart data available</Text>
                                            )}
                                            <View style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "flex-start", gap: 20 }}>
                                                <View style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 5 }}>
                                                    <View style={{ backgroundColor: Color.blue, width: 5, height: 5, borderRadius: 9999 }} />
                                                    <Text style={{ color: Color.blue, fontWeight: Typography.body16.fontWeight }}>Your game played</Text>
                                                </View>
                                                <View style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 5 }}>
                                                    <View style={{ backgroundColor: Color.green, width: 5, height: 5, borderRadius: 999 }} />
                                                    <Text style={{ color: Color.green, fontWeight: Typography.body16.fontWeight }}>Average games by peers</Text>
                                                </View>
                                            </View>
                                        </Card>
                                    ) : (
                                        <Text style={{ color: Color.gray }}>No chart data available</Text>
                                    )}

                                </View>
                            </View>

                            <View
                                style={{
                                    width: "100%",
                                    height: "35%",
                                    flexDirection: "row",
                                    alignSelf: "flex-start",
                                    // backgroundColor: "red",
                                }}
                            >
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={{ height: "90%", width: "99%" }}
                                    contentContainerStyle={{
                                        paddingRight: "56%",
                                        paddingLeft: "1%",
                                        alignItems: "center",
                                        gap: 20
                                    }}
                                >
                                    {/* 🟦 Total Words Learned */}
                                    <Card
                                        style={{
                                            width: "25%",
                                            height: "60%",
                                            backgroundColor: "#F2F8F9",
                                            padding: 12,
                                            justifyContent: "center",
                                            alignItems: "center",
                                            borderRadius: 20,
                                        }}
                                    >
                                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                                            <Pencil width={50} height={50} />
                                            <View style={{ marginLeft: 10 }}>
                                                <Text style={{ fontSize: Typography.header20.fontSize, color: Color.gray }}>Words Learned</Text>
                                                <Text style={{ color: Color.gray, fontSize: Typography.header16.fontSize }}>
                                                    {wordsLearned && "error" in wordsLearned
                                                        ? "Error"
                                                        : wordsLearned && "wordsLearned" in wordsLearned
                                                            ? `${wordsLearned.wordsLearned} Word(s)`
                                                            : "0 Word(s)"}
                                                </Text>
                                            </View>
                                        </View>
                                    </Card>

                                    {/* 🟩 Total Playtime */}
                                    <Card
                                        style={{
                                            width: "25%",
                                            height: "60%",
                                            backgroundColor: "#F2F8F9",
                                            padding: 12,
                                            justifyContent: "center",
                                            alignItems: "center",
                                            borderRadius: 20,
                                        }}
                                    >
                                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                                            <Clock width={50} height={50} />
                                            <View style={{ marginLeft: 10 }}>
                                                <Text style={{ fontSize: Typography.header20.fontSize, color: Color.gray }}>Total Playtime</Text>
                                                <Text style={{ color: Color.gray, fontSize: Typography.header16.fontSize }}>
                                                    {totalPlaytime && "error" in totalPlaytime
                                                        ? "Error"
                                                        : totalPlaytime && "totalPlaytime" in totalPlaytime
                                                            ? `${totalPlaytime.totalPlaytime} Hour(s)`
                                                            : "0 Hour(s)"}
                                                </Text>
                                            </View>
                                        </View>
                                    </Card>

                                    {streakCards.map((card, idx) => (
                                        <Card
                                            key={idx}
                                            style={{
                                                width: "25%",
                                                height: "60%",
                                                backgroundColor: "#F2F8F9",
                                                // paddingHorizontal: 20,
                                                paddingRight: 20,
                                                justifyContent: "center",
                                                alignItems: "center",
                                                borderRadius: 20,
                                            }}
                                        >
                                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                                {/* Render the icon */}
                                                <card.icon width={50} height={50} />
                                                <View style={{ marginLeft: 3, gap: 5 }}>
                                                    <Text style={{ width: "100%", textAlign: "center", fontSize: Typography.header20.fontSize, color: Color.gray }}>{card.label}</Text>
                                                    <Text style={{
                                                        color: Color.gray, fontSize: Typography.header20.fontSize, textAlign: "center", fontWeight: "bold"
                                                    }}>
                                                        {card.value as any}
                                                    </Text>
                                                </View>
                                            </View>
                                        </Card>
                                    ))}
                                </ScrollView>
                            </View>
                        </View >
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

                    </View >
                    {/* <Portal >
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
                                        </View>
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
            </Portal > */}
                </>
            )}
        </View>
    );
};

export default UserOverviewPerformance;