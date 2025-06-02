import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface FontSizeModalProps {
  visible: boolean;
  tempFontSize: number;
  setTempFontSize: (size: number) => void;
  onConfirm: () => void;
  onClose: () => void;
}

const FontSizeModal: React.FC<FontSizeModalProps> = ({
  visible,
  tempFontSize,
  setTempFontSize,
  onConfirm,
  onClose,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Adjust Font Size</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={() => setTempFontSize(tempFontSize + 2)}>
              <Text style={styles.adjustText}>A+</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setTempFontSize(tempFontSize > 8 ? tempFontSize - 2 : 8)}>
              <Text style={styles.adjustText}>A-</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onConfirm} style={styles.adjustButton}>
            <Text style={styles.adjustButtonText}>Adjust</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default FontSizeModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  adjustText: {
    fontSize: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#eee',
    borderRadius: 10,
    marginHorizontal: 10,
  },
  adjustButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 10,
  },
  adjustButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
