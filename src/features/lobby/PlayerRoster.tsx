import { ScrollView, StyleSheet, Text, View } from "react-native";
import { CatalogLine, EraSelect, TextInput } from "@shared/ui";
import { useT, type Era } from "@shared/lib";
import type { Player } from "@entities/player";
import { useTheme } from "@theme";
import { ERA_COLORS, fonts } from "@theme/tokens";

type PlayerRosterProps = {
  players: Player[];
  onName: (idx: number, name: string) => void;
  onEra: (idx: number, era: Era) => void;
  hostLockedAt?: number | null;
};

export function PlayerRoster({ players, onName, onEra, hostLockedAt = null }: PlayerRosterProps) {
  const t = useT();
  const { colors } = useTheme();
  const activeCount = players.filter((p) => p.name).length;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <CatalogLine
        left={t("roster.heading")}
        right={`${activeCount} / 4`}
        style={styles.countLine}
      />

      {players.map((p, i) => {
        const filled = p.name.length > 0;
        const isLocked = hostLockedAt === i;
        const eraBorderColor = filled && p.era ? ERA_COLORS[p.era].primary : colors.ink3;

        return (
          <View
            key={p.id}
            style={[
              styles.playerRow,
              { backgroundColor: colors.ink2, borderLeftColor: eraBorderColor },
            ]}
          >
            <View style={styles.playerMeta}>
              <Text style={[styles.playerLabel, { color: colors.gold }]}>
                {isLocked
                  ? t("roster.you")
                  : `${t("roster.playerPrefix")}${String(i + 1).padStart(2, "0")}`}
              </Text>
              <TextInput
                value={p.name}
                onChangeText={(text) => onName(i, text)}
                placeholder={i < 2 ? t("roster.enterName") : t("roster.optional")}
                maxLength={12}
                editable={!isLocked}
                autoCapitalize="characters"
              />
            </View>

            <EraSelect value={p.era ?? null} onChange={(era) => onEra(i, era)} />
          </View>
        );
      })}

      <Text style={[styles.hint, { color: colors.cream3 }]}>{t("roster.hint")}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 8,
  },
  countLine: {
    marginBottom: 10,
  },
  playerRow: {
    borderLeftWidth: 3,
    padding: 12,
    gap: 10,
  },
  playerMeta: {
    gap: 6,
  },
  playerLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 9 * 0.22,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  hint: {
    fontFamily: fonts.condensed,
    fontSize: 11,
    letterSpacing: 11 * 0.1,
    textTransform: "uppercase",
    textAlign: "center",
    marginTop: 12,
    includeFontPadding: false,
  },
});
