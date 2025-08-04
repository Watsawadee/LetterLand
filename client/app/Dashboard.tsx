import GardenBackgroundBlueSky from "@/assets/backgroundTheme/GardenBackgroundBlue"
import UserOverviewCard from "../components/UserOverViewCard";
import { useEffect, useState } from "react";
import { getLoggedInUserId } from "@/utils/auth";
import { useUserProfile } from "@/hooks/useGetUserProfile";
import { View } from "react-native";
import TotalGameThisWeek from "@/components/UserOverViewPerformance";
import { Text } from "react-native-paper";
import UserOverviewPerformance from "@/components/UserOverViewPerformance";
const Dashboard = () => {
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
                    width: "100%",
                    height: 1000,
                    zIndex: 0,
                }} />
            <View style={{ flexDirection: 'row', width: "100%", justifyContent: "space-around" }}>
                <UserOverviewPerformance />
                <UserOverviewCard />
            </View>

        </View>
    )
}
export default Dashboard