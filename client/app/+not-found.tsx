import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Color } from "@/theme/Color";
import { Typography } from "@/theme/Font";
import NotFound from "@/assets/icon/NotFound";
import { CustomButton } from "@/theme/ButtonCustom";

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <NotFound />
        <Text style={[styles.code, Typography?.h1]}>404</Text>
        <Text style={[styles.title, Typography?.h3]}>Page not found</Text>
        <Text style={styles.subtitle}>
          The page you’re looking for doesn’t exist or has moved.
        </Text>
        <CustomButton
          label="Go Home"
          type="medium"
          onPress={() => router.replace("/Home")}
          customStyle={{ marginTop: 20 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.lightblue,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    alignItems: "center",
    paddingVertical: 50,
    paddingHorizontal: 80,
  },
  code: { ...Typography.header45, marginTop: 8, color: Color.gray },
  title: { ...Typography.header30, marginTop: 2, color: Color.gray },
  subtitle: {
    marginTop: 6,
    ...Typography.body20,
    color: Color.gray,
    textAlign: "center",
  },
});
