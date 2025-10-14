import React from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { ConfirmModalProps } from "../types/type";
import { Color } from "../theme/Color";
import { Typography } from "@/theme/Font";

export default function ConfirmModal({
  visible = false,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Yes",
  cancelText = "No",
}: ConfirmModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.container}>
          {!!title && <Text style={styles.title}>{title}</Text>}
          {!!message && <Text style={styles.message}>{message}</Text>}

          <View style={styles.buttons}>
            <Pressable
              onPress={onCancel}
              style={[styles.button, styles.leftBtn]}
            >
              <Text style={[styles.buttonText, styles.leftText]}>
                {cancelText}
              </Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              style={[styles.button, styles.rightBtn]}
            >
              <Text style={[styles.buttonText, styles.rightText]}>
                {confirmText}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Color.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  container: {
    width: 500,
    maxWidth: "90%",
    backgroundColor: Color.lightblue,
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 20,
    shadowColor: Color.black,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  title: {
    textAlign: "center",
    marginBottom: 6,
  },
  message: {
    ...Typography.popupbody20,
    color: Color.gray,
    textAlign: "center",
    marginBottom: 20,
     lineHeight: 30,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
  },
  button: {
    minWidth: 104,
    paddingVertical: 12,
    paddingHorizontal: 35,
    borderRadius: 16,
    alignItems: "center",
  },
  leftBtn: {
    backgroundColor: Color.white,
    borderWidth: 1,
    borderColor: Color.lightblue,
    borderRadius: 12,
    shadowColor: Color.gray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  leftText: {
    color: Color.gray,
    ...Typography.popupbody20,
  },
  rightBtn: {
    backgroundColor: Color.blue,
  },
  rightText: {
    color: Color.white,
    ...Typography.popupbody20,
  },
  buttonText: {},
});
