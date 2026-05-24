import { StyleSheet, Text } from "react-native";
import type { ReactNode } from "react";
import { useTheme } from "@theme";
import { fonts } from "@theme/tokens";

export function FieldLabel({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.label, { color: colors.gold }]}>{children}</Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 9 * 0.22,
    textTransform: "uppercase",
    marginBottom: 6,
    includeFontPadding: false,
  },
});
