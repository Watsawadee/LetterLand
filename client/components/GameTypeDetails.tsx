import React from "react";
import { View, Text, StyleSheet, Platform, ScrollView } from "react-native";
import { Dialog, IconButton } from "react-native-paper";

import { Color } from "@/theme/Color";
import { Typography } from "@/theme/Font";

import CloseIcon from "@/assets/icon/CloseIcon";
import GameTypeBackground from "@/assets/backgroundTheme/GameTypeBackground";
import GameTypeGrid from "@/assets/icon/GameTypeGrid";

type Props = { visible: boolean; onDismiss: () => void };

export default function GameTypeDetails({ visible, onDismiss }: Props) {
  return (
    <Dialog
      visible={visible}
      onDismiss={onDismiss}
      style={styles.dialog}
      theme={{ colors: { backdrop: Color.overlay } }}
    >
      {/* Decorative bottom-half background (green, with letters) */}
      <View style={styles.bgHalf}>
        <GameTypeBackground
          pointerEvents="none"
          style={{}}
        />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Game Type</Text>
        <IconButton
          icon={(p) => (
            <CloseIcon width={22} height={22} fillColor={Color.gray} {...p} />
          )}
          onPress={onDismiss}
          style={styles.closeBtn}
          accessibilityLabel="Close dialog"
        />
      </View>

      {/* Content */}
      <Dialog.Content>
        <View>
          {/* --- CROSSWORD SEARCH --- */}
          <Text style={[styles.sectionTitle, styles.sectionTitleGray]}>
            Crossword search
          </Text>
          <View style={styles.cardGray}>
            <GameTypeGrid emptyColor="#FFFFFF" />
            <View style={styles.qaWrap}>
              <Text style={styles.grayLine}>Q. What pet purrs?</Text>
              <Text style={styles.grayLine}>Q. What pet barks?</Text>
              <Text style={styles.grayLine}>Q. What gives milk?</Text>
              <Text style={styles.grayLine}>Q. What makes honey?</Text>
            </View>
          </View>

          <Text style={[styles.desc, styles.descGray]}>
            A puzzle where words are hidden in a grid of random letters, and you
            must find and circle them and the question is in form of sentence
          </Text>

          {/* --- WORD SEARCH --- */}
          <Text style={[styles.sectionTitle, styles.sectionTitleWhite]}>
            Word search
          </Text>

          <View style={styles.cardWhite}>
            <GameTypeGrid emptyColor="#AEAEAE" />

            <View style={styles.wordsWrap}>
              <View style={styles.wordRow}>
                <View style={styles.wordPill}>
                  <Text style={styles.wordText}>Dog</Text>
                </View>
                <View style={styles.wordPill}>
                  <Text style={styles.wordText}>Bee</Text>
                </View>
              </View>
              <View style={styles.wordRow}>
                <View style={styles.wordPill}>
                  <Text style={styles.wordText}>Cat</Text>
                </View>
                <View style={styles.wordPill}>
                  <Text style={styles.wordText}>Cow</Text>
                </View>
              </View>
            </View>
          </View>

          <Text style={[styles.desc, styles.descWhite]}>
            A puzzle where words are hidden in a grid of random letters, and you
            must find and circle them. The list of words to find is usually
            given, not as clues in sentence form
          </Text>

          <View style={{ height: 8 }} />
        </View>
      </Dialog.Content>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  dialog: {
    width: 435,
    height: 750,
    alignSelf: "center",
    backgroundColor: Color.lightblue,
    borderRadius: 22,
    overflow: "hidden",
    padding: 16,
  },
  bgHalf: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "55%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 6,
  },
  title: {
    ...Typography.popupheader,
    color: Color.gray,
    marginBottom: 10,
  },
  closeBtn: { margin: 0 },
  sectionTitle: {
    ...Typography.header20,
    marginBottom: 18,
  },
  sectionTitleGray: { color: Color.gray },
  sectionTitleWhite: { color: Color.white, marginTop: 18 },
  cardGray: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#AEAEAE",
    padding: 15,
    borderRadius: 18,
    gap: 22,
    marginBottom: 20,
  },
  qaWrap: {
    flex: 1,
    gap: 12,
  },
  grayLine: {
    ...Typography.header13,
    color: Color.white,
  },
  cardWhite: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Color.white,
    padding: 20,
    borderRadius: 18,
    gap: 10,
    marginBottom: 12,
    width: 350,
  },
  wordsWrap: {
    gap: 8,
  },
  wordRow: {
    flexDirection: "row",
    gap: 12,
  },
  wordPill: {
    backgroundColor: "#AEAEAE",
    paddingVertical: 8,
    borderRadius: 999,
    minWidth: 90,
    alignItems: "center",
  },
  wordText: {
    ...Typography.header13,
    color: Color.white,
  },
  desc: {
    ...Typography.header16,
    lineHeight: 20,
    marginBottom: 35,
  },
  descGray: { color: Color.gray },
  descWhite: { color: Color.white, marginTop: 8 },
});
