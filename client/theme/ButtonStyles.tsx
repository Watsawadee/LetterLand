// buttonStyles.ts
import { ViewStyle, TextStyle } from "react-native";
import { Color } from "./Color";
import { Typography } from "./Font";

const baseContainer: ViewStyle = {
  backgroundColor: Color.blue,
  borderRadius: 20,
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "row",
  paddingHorizontal: 16,
};

export const ButtonStyles: {
  [key: string]: {
    container: ViewStyle;
    text: TextStyle;
  };
} = {
  small: {
    container: {
      ...baseContainer,
      width: 126,
      height: 54,
    },
    text: {
      ...Typography.Button,
      color: Color.white,
    },
  },
  medium: {
    container: {
      ...baseContainer,
      width: 237,
      height: 54,
    },
    text: {
      ...Typography.Button,
      color: Color.white,
    },
  },
  large: {
    container: {
      ...baseContainer,
      width: 427,
      height: 54,
    },
    text: {
      ...Typography.Button,
      color: Color.white,
    },
  },
  createPuzzle: {
    container: {
      ...baseContainer,
      width: 165,
      height: 94,
    },
    text: {
      ...Typography.Button,
      color: Color.white,
    },
  },
  wordBank: {
    container: {
      ...baseContainer,
      width: 150,
      height: 59,
    },
    text: {
      ...Typography.Button,
      color: Color.white,
    },
  },
  publicGame: {
    container: {
      ...baseContainer,
      width: 250,
      height: 43,
    },
    text: {
      ...Typography.Button,
      color: Color.white,
    },
  },
  fontSize: {
    container: {
      backgroundColor: Color.green,
      height: 99,
      width: 99,
      borderRadius: 130,
      justifyContent: "center",
      alignItems: "center",
    },
    text: {},
  },
  buyHint: {
    container: {
      backgroundColor: Color.pink,
      height: 99,
      width: 99,
      borderRadius: 130,
      justifyContent: "center",
      alignItems: "center",
    },
    text: {
      ...Typography.header20,
      color: Color.white,
    },
  },
  useHint: {
    container: {
      backgroundColor: "#B5B5B5",
      height: 99,
      width: 99,
      borderRadius: 130,
      justifyContent: "center",
      alignItems: "center",
    },
    text: {
      ...Typography.header20,
      color: Color.white,
    },
  },
};
