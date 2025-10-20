import GardenBackgroundBlueSky from "@/assets/backgroundTheme/GardenBackgroundBlue"
import UserOverviewCard from "../components/UserOverViewCard";
import { useEffect, useState } from "react";
import { getLoggedInUserId } from "@/utils/auth";
import { useUserProfile } from "@/hooks/useGetUserProfile";
import { View, Dimensions, TouchableOpacity, Pressable } from "react-native";
import TotalGameThisWeek from "@/components/UserOverViewPerformance";
import { Text } from "react-native-paper";
import UserOverviewPerformance from "@/components/UserOverViewPerformance";
import UserSettingCard from "@/components/UserSettingCard";
import { fetchUserCoins } from "@/services/achievementService";
import { ButtonStyles } from "@/theme/ButtonStyles";
import { Color } from "@/theme/Color";
import ArrowLeft from "@/assets/icon/ArrowLeft";
import { router } from "expo-router";
import Book from "@/assets/icon/Book";
import WordBankModal from "@/components/WordBank";

type Props = {
    coins?: number;
    onOpenSettings?: () => void;
};
const Dashboard = () => {
    const screenWidth = Dimensions.get("window").width;
    const [coins, setCoins] = useState(0);
    const [showSettings, setShowSettings] = useState(false);
    const [showBook, setShowBook] = useState(false);

    useEffect(() => {
        const loadCoins = async () => {
            try {
                const balance = await fetchUserCoins();
                setCoins(balance);
            } catch (e) {
                console.error("Failed to load coins:", e);
            }
        };
        loadCoins();
    }, []);

    const { data: profile, isLoading, error } = useUserProfile();
    if (isLoading) return <Text>Loading...</Text>;
    if (error) return <Text>Error loading profile</Text>;
    return (
        <View
            style={{
                flex: 1,
                width: "100%",
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f0f0f0",
                padding: 16,
            }}
        >

            <GardenBackgroundBlueSky
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "110%",
                    height: 1000,
                    zIndex: 0,
                }} />
            <View style={{
                flexDirection: 'row', justifyContent: "space-between", flex: 1,
                height: "100%",
                width: "100%",
                alignItems: "center",
                padding: 16,
            }}>
                <View style={{ width: "65%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <UserOverviewPerformance />
                </View>

                {showSettings ? (
                    <View style={{ width: "33%" }}>
                        <UserSettingCard onBack={() => setShowSettings(false)} />
                    </View>
                ) : (
                    <View style={{ width: "33%" }}>
                        <UserOverviewCard coins={coins} onOpenSettings={() => setShowSettings(true)} />
                    </View>
                )}
            </View>

        </View >
    )
}
export default Dashboard