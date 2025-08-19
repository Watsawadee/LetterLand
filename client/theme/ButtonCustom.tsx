import React from 'react';
import { Text, TouchableOpacity, View, StyleProp, ViewStyle } from 'react-native';
import { ButtonStyles } from './ButtonStyles';

type ButtonType = keyof typeof ButtonStyles;

interface Props {
  label?: string;
  onPress: () => void;
  type: ButtonType;  
  icon?: React.ReactNode;
  //customStyle?: StyleProp<ViewStyle>; เอาไว้ style เพิ่มเติม
}

export const CustomButton = ({ label, onPress, type, icon }: Props) => {
  const { container, text } = ButtonStyles[type]; 

  return (
    <TouchableOpacity onPress={onPress} style={[container]}>
      {icon && <View>{icon}</View>}
      <Text style={text}>{label}</Text>
    </TouchableOpacity>
  );
};
