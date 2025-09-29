import React, { useRef, useState } from "react";
import { View, Pressable, StyleSheet, Animated, Easing } from "react-native";
import { Color } from "@/theme/Color";
import SettingIcon from "@/assets/icon/settingIcon";
import FontIcon from "@/assets/icon/FontIcon";
import ShopIcon from "@/assets/icon/ShopIcon";
import { CustomButton } from "@/theme/ButtonCustom";
import TutorialIcon from "@/assets/icon/Tutorial";

type Props = {
  onOpenFont?: () => void;
  onOpenShop?: () => void;
  onOpenTutorial?: () => void; // optional
};

export default function SideToolBar({
  onOpenFont,
  onOpenShop,
  onOpenTutorial,
}: Props) {
  const [open, setOpen] = useState(false);
  const slide = useRef(new Animated.Value(0)).current;

  const animateTo = (to: number, cb?: () => void) =>
    Animated.timing(slide, {
      toValue: to,
      duration: 220,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(cb);

  const toggle = () => {
    setOpen((v) => {
      const next = v ? 0 : 1;
      animateTo(next);
      return !v;
    });
  };

  const close = () => animateTo(0, () => setOpen(false));

  const handle = (fn?: () => void) => () => {
    fn?.();
    close();
  };

  const translateX = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [80, 0],
  });
  const opacity = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      <Pressable style={styles.fab} onPress={toggle}>
        <SettingIcon fill="white" />
      </Pressable>

      <Animated.View
        pointerEvents={open ? "auto" : "none"}
        style={[styles.panel, { transform: [{ translateX }], opacity }]}
      >
        <View style={styles.stack}>
          <CustomButton
            onPress={handle(onOpenFont)}
            type="fontSize"
            icon={<FontIcon />}
          />

          <CustomButton
            onPress={handle(onOpenShop)}
            type="hintshop"
            icon={<ShopIcon />}
          />

          <CustomButton
            onPress={handle(onOpenFont)}
            type="tutorial"
            icon={<TutorialIcon />}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    right: 16,
    top: 16,
    bottom: 16,
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Color.pink,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: Color.black,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: 10,
  },
  panel: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  stack: { gap: 14, alignItems: "center", justifyContent: "center",},
});
