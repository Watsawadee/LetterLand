import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Slider from "@react-native-community/slider";
import { FontSizeModalProps } from "../types/type";


export default function FontSizeModal({
  visible,
  tempFontSize,
  setTempFontSize,
  onConfirm,
  onClose,
}: FontSizeModalProps) {
  return (
    <Modal animationType="fade" transparent visible={visible}>
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <Text style={styles.title}>Adjust Font Size</Text>

          <Slider
            style={styles.slider}
            minimumValue={30}
            maximumValue={40}
            step={1}
            value={tempFontSize}
            onValueChange={setTempFontSize}
            accessibilityLabel="Font size slider"
          />

          <Text style={styles.fontSizeText}>{tempFontSize}px</Text>

          <View style={styles.buttons}>
            <TouchableOpacity onPress={onClose} style={styles.button}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              style={[styles.button, styles.confirm]}
            >
              <Text style={[styles.buttonText, { color: "white" }]}>Adjust</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: 280,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 20 },
  slider: { width: 200, height: 40 },
  fontSizeText: { fontSize: 16, marginVertical: 10 },
  buttons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%",
  },
  button: { paddingHorizontal: 15, paddingVertical: 8, marginLeft: 10 },
  buttonText: { fontSize: 16, color: "blue" },
  confirm: { backgroundColor: "blue", borderRadius: 4 },
});
