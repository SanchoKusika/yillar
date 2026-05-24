import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import type { ReactNode } from "react";
import { useTheme } from "@theme";
import { fonts } from "@theme/tokens";

type CatalogLineProps = {
  left: ReactNode;
  right: ReactNode;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

export function CatalogLine({ left, right, color, style }: CatalogLineProps) {
  const { colors } = useTheme();
  const resolvedColor = color ?? colors.gold;

  return (
    <View style={[styles.row, style]}>
      <Text style={[styles.text, { color: resolvedColor }]}>{left}</Text>
      <Text style={[styles.text, { color: resolvedColor }]}>{right}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  text: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 10 * 0.22,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
});
