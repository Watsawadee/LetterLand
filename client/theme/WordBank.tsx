import { StyleSheet } from 'react-native';

export const wordBankStyles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 30,
    zIndex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 5,
  },
  closeText: {
    fontSize: 18,
    color: '#333',
  },
});


