import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { CardProps } from '../types/gametypes';
import { cardStyles as styles } from '../theme/CardStyles'; // adjust path as needed


export const Card: React.FC<CardProps> = ({
  image,
  title,
  subtitle,
  level,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.title}>{title}</Text>
          {level && <Text style={styles.level}>{level}</Text>}
        </View>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </TouchableOpacity>
  );
};

