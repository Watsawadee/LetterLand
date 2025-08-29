import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { ConfirmModalProps } from "../types/type";

export default function ConfirmModal({
  visible = false,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "OK",
  cancelText = "Cancel",
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
          {title && <Text style={styles.title}>{title}</Text>}
          {message && <Text style={styles.message}>{message}</Text>}

          <View style={styles.buttons}>
            <Pressable onPress={onCancel} style={[styles.button]}>
              <Text style={[styles.buttonText, { color: "blue" }]}>
                {cancelText}
              </Text>
            </Pressable>

            <Pressable onPress={onConfirm} style={[styles.button, styles.confirm]}>
              <Text style={[styles.buttonText, { color: "white" }]}>
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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: 300,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  message: { fontSize: 16, marginBottom: 20 },
  buttons: { flexDirection: "row", justifyContent: "flex-end" },
  button: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginLeft: 10,
    borderRadius: 6,
  },
  buttonText: { fontSize: 16 },
  confirm: { backgroundColor: "blue" },
});
