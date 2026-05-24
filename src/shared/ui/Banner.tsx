import { StyleSheet, Text, View } from "react-native";
import type { ReactNode } from "react";
import { useTheme } from "@theme";
import { fonts } from "@theme/tokens";

type BannerVariant = "error" | "gold";

export function Banner({ variant = "error", children }: { variant?: BannerVariant; children: ReactNode }) {
  const { colors } = useTheme();
  const borderColor = variant === "gold" ? colors.gold : colors.danger;
  const textColor = variant === "gold" ? colors.gold : colors.danger;

  return (
    <View style={[styles.wrap, { borderColor }]}>
      <Text style={[styles.text, { color: textColor }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  text: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 10 * 0.15,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
});
