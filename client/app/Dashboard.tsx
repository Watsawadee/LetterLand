import GardenBackgroundBlueSky from "@/assets/backgroundTheme/GardenBackgroundBlue"
import UserOverviewCard from "../components/UserOverViewCard";
import { useEffect, useState } from "react";
import { getLoggedInUserId } from "@/utils/auth";
import { useUserProfile } from "@/hooks/useGetUserProfile";
import { View, Dimensions } from "react-native";
import TotalGameThisWeek from "@/components/UserOverViewPerformance";
import { Text } from "react-native-paper";
import UserOverviewPerformance from "@/components/UserOverViewPerformance";
import UserSettingCard from "@/components/UserSettingCard";

type Props = {
    coins?: number;
    onOpenSettings?: () => void;
};
const Dashboard = () => {
    const screenWidth = Dimensions.get("window").width;
    const [coins, setCoins] = useState(0);
    const [showSettings, setShowSettings] = useState(false);

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
                flexDirection: 'row', width: "100%", justifyContent: "space-between", flex: 1,
                height: "100%",
                alignItems: "center",
                padding: 16,
            }}>
                <UserOverviewPerformance />
                {showSettings ? (
                    <UserSettingCard onBack={() => setShowSettings(false)} />
                ) : (
                    <UserOverviewCard coins={coins} onOpenSettings={() => setShowSettings(true)} />
                )}
            </View>

        </View>
    )
}
export default Dashboard