import { StyleSheet, Text } from "react-native";
import { useTheme } from "@theme";
import { fonts, shadows } from "@theme/tokens";

export function Multiplier({ n = 1 }: { n?: number }) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.badge, { backgroundColor: colors.ink, color: colors.gold }]}>
      ×{n}
    </Text>
  );
}

const styles = StyleSheet.create({
  badge: {
    fontFamily: fonts.display,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 28 * -0.02,
    lineHeight: 40,
    paddingVertical: 4,
    paddingHorizontal: 14,
    includeFontPadding: false,
    ...shadows.paper,
    shadowColor: "rgba(0,0,0,0.3)",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
});
