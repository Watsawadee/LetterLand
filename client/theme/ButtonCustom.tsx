import React from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { ButtonStyles } from "./ButtonStyles";

type ButtonType = keyof typeof ButtonStyles;

interface Props {
  label?: string;
  onPress: () => void;
  type: ButtonType;
  icon?: React.ReactNode;
  disabled?: boolean;
  number?: number;
  customStyle?: StyleProp<ViewStyle>;
  customTextStyle?: StyleProp<TextStyle>;
  iconStyle?: StyleProp<ViewStyle>;
}

export const CustomButton = ({
  label,
  onPress,
  disabled,
  type,
  icon,
  number,
  customStyle,
  customTextStyle,
  iconStyle,
}: Props) => {
  const { container, text } = ButtonStyles[type];
  const hasText = (label && label.trim().length > 0) || number !== undefined;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        container,
        !hasText && { justifyContent: "center", alignItems: "center" },
        customStyle,
      ]}
    >
      {hasText ? (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon && <View style={[{ marginRight: 8 }, iconStyle]}>{icon}</View>}
          <Text style={[text, customTextStyle]}>
            {label} {number !== undefined ? number : ""}
          </Text>
        </View>
      ) : (
        icon && <View style={iconStyle}>{icon}</View>
      )}
    </TouchableOpacity>
  );
};
