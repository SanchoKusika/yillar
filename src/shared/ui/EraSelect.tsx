import { Pressable, StyleSheet, Text, View } from "react-native";
import { ERAS, ERA_LABEL, type Era } from "@shared/lib/era";
import { useT } from "@shared/lib/i18n";
import { ERA_COLORS, fonts } from "@theme/tokens";

type EraSelectProps = {
  value: Era | null;
  onChange: (era: Era) => void;
};

export function EraSelect({ value, onChange }: EraSelectProps) {
  const t = useT();
  return (
    <View style={styles.grid}>
      {ERAS.map((era) => {
        const active = value === era;
        const eraColors = ERA_COLORS[era];
        return (
          <Pressable
            key={era}
            onPress={() => onChange(era)}
            style={[
              styles.btn,
              active
                ? { backgroundColor: eraColors.primary }
                : { borderWidth: 1, borderColor: eraColors.primary },
            ]}
          >
            <Text
              style={[
                styles.sublabel,
                { color: active ? eraColors.surface : eraColors.primary },
              ]}
            >
              {ERA_LABEL[era]}
            </Text>
            <Text
              style={[
                styles.label,
                { color: active ? eraColors.surface : eraColors.primary },
              ]}
            >
              {t(`era.${era}` as const)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    gap: 6,
  },
  btn: {
    flex: 1,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  sublabel: {
    fontFamily: fonts.condensed,
    fontSize: 9,
    letterSpacing: 9 * 0.12,
    textTransform: "uppercase",
    opacity: 0.8,
    includeFontPadding: false,
  },
  label: {
    fontFamily: fonts.condensedBold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 10 * 0.2,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
});
