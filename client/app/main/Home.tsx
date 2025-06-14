import { Button, Card, Text, YStack } from "tamagui";
import UserOverviewCard from "../../components/UserOverViewCard";
import WordLearn from "../../assets/images/WordLearn.png";
import Clock from "../../assets/images/Clock.png";
import { getLoggedInUserId } from "@/utils/auth";
import { useEffect, useState } from "react";

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getLoggedInUserId();
      setUserId(id);
      console.log("Logged-in User ID:", id);
    }
    fetchUserId();
  }, [])

  if (!userId) {
    return (
      <YStack justifyContent="center" alignItems="center" flex={1}>
        <Text>Loading...</Text>
      </YStack>
    );
  }
  return (
    <YStack
      flex={1}
      width="100%"
      height="100%"
      justifyContent="center"
      alignItems="center"
      backgroundColor="#f0f0f0"
      padding="$4"
    >
      <UserOverviewCard
        icon={WordLearn}
        icon2={Clock}
        title="Word Learn"
        value="580 Word(s)"
        title2="Total Playtime"
        value2="56/200 Hour(s)"
        userId={userId}
      />
    </YStack>
  );
}
