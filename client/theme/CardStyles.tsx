// theme/cardStyles.ts
import { StyleSheet } from 'react-native';
import { Typography } from './Font';

export const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    width: 200,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 100,
  },
  content: {
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...Typography.header16,
  },
  level: {
    ...Typography.body10,
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  subtitle: {
    ...Typography.body13,
    color: '#666',
    marginTop: 4,
  },
});
