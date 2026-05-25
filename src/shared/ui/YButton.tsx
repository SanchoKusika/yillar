import { Pressable, StyleSheet, Text, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import type { ReactNode } from "react";
import type { Era } from "@shared/lib/era";
import { useTheme } from "@theme";
import { ERA_COLORS, fonts, shadows } from "@theme/tokens";

type Variant = "primary" | "ink" | "ghost" | "era";

type YButtonProps = Omit<PressableProps, "children" | "style"> & {
  children: ReactNode;
  variant?: Variant;
  era?: Era;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function YButton({
  children,
  variant = "primary",
  era,
  disabled = false,
  style,
  ...rest
}: YButtonProps) {
  const { colors } = useTheme();

  const eraColors = era ? ERA_COLORS[era] : null;

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case "primary":
        return { backgroundColor: colors.gold, ...shadows.cut };
      case "ink":
        return { backgroundColor: colors.ink };
      case "ghost":
        return { backgroundColor: "transparent", borderWidth: 2, borderColor: colors.cream };
      case "era":
        return eraColors
          ? { backgroundColor: eraColors.primary, ...shadows.cut }
          : { backgroundColor: colors.gold };
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case "primary": return colors.ink;
      case "ink": return colors.cream;
      case "ghost": return colors.cream;
      case "era": return eraColors ? eraColors.surface : colors.ink;
    }
  };

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        getVariantStyle(),
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {({ pressed: _ }) => (
        <Text style={[styles.label, { color: getTextColor() }]}>{children}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 0,
  },
  pressed: {
    transform: [{ translateX: 1 }, { translateY: 1 }],
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontFamily: fonts.condensedBold,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 13 * 0.14,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
});
