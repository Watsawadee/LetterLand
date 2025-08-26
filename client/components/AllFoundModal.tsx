import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

type Props = { visible: boolean; onClose: () => void };

export default function AllFoundModal({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.text}>🎉 Congratulations! You found all words! 🎉</Text>
          <TouchableOpacity style={styles.btn} onPress={onClose}>
            <Text style={styles.btnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  content: { width: "80%", backgroundColor: "white", padding: 25, borderRadius: 10, alignItems: "center" },
  text: { fontSize: 18, marginBottom: 20, textAlign: "center" },
  btn: { backgroundColor: "#007AFF", paddingVertical: 10, paddingHorizontal: 25, borderRadius: 6 },
  btnText: { color: "white", fontSize: 16 },
});