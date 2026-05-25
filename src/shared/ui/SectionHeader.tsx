import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@theme";
import { fonts } from "@theme/tokens";

export function SectionHeader({ title }: { title: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.root}>
      <Text style={[styles.text, { color: colors.gold }]}>{title}</Text>
      <View style={[styles.line, { backgroundColor: colors.gold }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 16,
    paddingBottom: 10,
  },
  text: {
    fontFamily: fonts.condensedExtraBold,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 14 * 0.18,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  line: {
    flex: 1,
    height: 1,
    opacity: 0.2,
  },
});
