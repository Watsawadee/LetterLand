import React from "react";
import { Modal, View, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { CustomButton } from "../theme/ButtonCustom";

interface GameEndModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  closeText?: string;
  onConfirm?: () => void;
  onClose?: () => void;
  confirmIcon?: React.ReactNode;
  closeIcon?: React.ReactNode;
  confirmIconStyle?: StyleProp<ViewStyle>;
  closeIconStyle?: StyleProp<ViewStyle>;
}

export default function GameEndModal({
  visible,
  title,
  message,
  confirmText,
  closeText,
  onConfirm,
  onClose,
  confirmIcon,
  closeIcon,
  confirmIconStyle,
  closeIconStyle,
}: GameEndModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonRow}>
            {onConfirm && (
              <CustomButton
                type="small"
                onPress={onConfirm}
                label={confirmText}
                icon={confirmIcon}
                iconStyle={confirmIconStyle}
                customStyle={{ justifyContent: "center", alignItems: "center" }}
              />
            )}

            {onClose && (
              <CustomButton
                type="small"
                onPress={onClose}
                label={closeText}
                icon={closeIcon}
                iconStyle={closeIconStyle}
                customStyle={{ justifyContent: "center", alignItems: "center" }}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    width: "80%",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    width: "100%",
  },
});
