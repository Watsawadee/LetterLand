import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: 'word' | 'crossword') => void;
};

export default function GameSelectionModal({ visible, onClose, onSelect }: Props) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Choose Your Game</Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.gameButton, { backgroundColor: '#d0eaff' }]}
              onPress={() => onSelect('word')}
            >
              <Text style={styles.buttonText}>Word Search Game</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.gameButton, { backgroundColor: '#ffe3cc' }]}
              onPress={() => onSelect('crossword')}
            >
              <Text style={styles.buttonText}>Crossword Search Game</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  gameButton: {
    padding: 15,
    borderRadius: 10,
    width: '45%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
