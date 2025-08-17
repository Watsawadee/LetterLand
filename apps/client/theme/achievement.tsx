import { StyleSheet } from 'react-native';

export const achievementCardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    width: 180,
    marginRight: 16,
    elevation: 2,
  },
  header: {
    marginBottom: 8,
  },
  coin: {
    fontSize: 12,
    color: '#f6b100',
    marginTop: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 4,
  },
  progressFill: {
    height: 6,
    backgroundColor: '#ec82c0',
    borderRadius: 4,
  },
  status: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
});
