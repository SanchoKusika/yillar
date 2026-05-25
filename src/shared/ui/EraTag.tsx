import { StyleSheet, Text } from "react-native";
import type { Era } from "@shared/lib/era";
import { useT } from "@shared/lib/i18n";
import { ERA_COLORS, fonts } from "@theme/tokens";

type EraTagProps = {
  era?: Era;
  boxed?: boolean;
  size?: "sm" | "lg";
};

export function EraTag({ era = "klassika", boxed = false, size = "sm" }: EraTagProps) {
  const t = useT();
  const eraColors = ERA_COLORS[era];
  const fontSize = size === "lg" ? 14 : 11;

  return (
    <Text
      style={[
        styles.base,
        { color: eraColors.primary, fontSize, letterSpacing: fontSize * 0.22 },
        boxed && {
          paddingVertical: 5,
          paddingHorizontal: 9,
          borderWidth: 1,
          borderColor: eraColors.primary,
        },
      ]}
    >
      {t(`era.${era}` as const)}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: fonts.condensedBold,
    fontWeight: "700",
    textTransform: "uppercase",
    includeFontPadding: false,
  },
});
