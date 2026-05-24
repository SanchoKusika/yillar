import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { CatalogLine, GirihOverlay, PhoneFrame, YButton } from "@shared/ui";
import { ERAS, eraColor, useT, shareResult } from "@shared/lib";
import { useGameStore, useActivePlayers } from "@entities/game";
import { useSessionStore } from "@entities/session";
import { useSaveGame } from "@features/save-game";
import { useProfileStats } from "@entities/game-history";
import { useTheme } from "@theme";
import { ERA_COLORS, fonts } from "@theme/tokens";
import StarMark from "@shared/assets/svg/star-mark.svg";

export default function EndPage() {
  const router = useRouter();
  const t = useT();
  const { colors } = useTheme();
  const activePlayers = useActivePlayers();
  const placements = useGameStore((s) => s.placements);
  const scores = useGameStore((s) => s.scores);
  const totalCards = useGameStore((s) => s.totalCards);
  const reset = useGameStore((s) => s.reset);
  const savedGameId = useGameStore((s) => s.savedGameId);
  const beginSave = useGameStore((s) => s.beginSave);
  const markGameSaved = useGameStore((s) => s.markGameSaved);
  const resetSaveFlag = useGameStore((s) => s.resetSaveFlag);
  const user = useSessionStore((s) => s.user);
  const profile = useSessionStore((s) => s.profile);
  const { mutate: persist } = useSaveGame();

  const hostPlayerId = activePlayers[0]?.id ?? null;
  const stats = useProfileStats(user?.id);
  const [shareLabel, setShareLabel] = useState<string | null>(null);

  const ranked = useMemo(
    () =>
      activePlayers
        .map((p) => ({ ...p, total: scores[p.id] ?? 0, placements: placements[p.id] ?? [] }))
        .sort((a, b) => b.total - a.total),
    [activePlayers, scores, placements],
  );

  const winner = ranked[0];
  const isNewRecord =
    winner?.id === hostPlayerId &&
    stats.data?.bestScore != null &&
    winner.total > stats.data.bestScore;

  function handleShare() {
    const lines = [
      "YILLAR",
      ...ranked.map((p, i) => `${i === 0 ? "★" : `${i + 1}.`} ${p.name} — ${p.total} ${t("end.points")}`),
      `${totalCards} ${t("share.cards")}`,
    ];
    shareResult(lines.join("\n")).then((outcome) => {
      if (outcome === "copied") {
        setShareLabel(t("share.copied"));
        setTimeout(() => setShareLabel(null), 2000);
      }
    });
  }

  useEffect(() => {
    if (savedGameId) return;
    if (!user || !winner || !hostPlayerId) return;
    if (!beginSave()) return;
    const hostName = profile?.displayName?.toUpperCase() || activePlayers[0]?.name || "HOST";
    persist(
      {
        hostId: user.id,
        totalCards,
        players: ranked.map((p, i) => {
          const isHost = p.id === hostPlayerId;
          return {
            displayName: isHost ? hostName : p.name,
            generation: p.era,
            totalScore: p.total,
            rank: i + 1,
            isWinner: i === 0,
            isHost,
            placements: p.placements,
          };
        }),
      },
      {
        onSuccess: (gameId) => markGameSaved(gameId),
        onError: () => resetSaveFlag(),
      },
    );
  }, [savedGameId, user, winner, ranked, persist, totalCards, profile?.displayName, hostPlayerId, activePlayers, beginSave, markGameSaved, resetSaveFlag]);

  if (!winner) {
    return (
      <PhoneFrame>
        <View style={[styles.emptyMain, { backgroundColor: colors.ink }]}>
          <YButton onPress={() => router.replace("/")}>{t("end.back")}</YButton>
        </View>
      </PhoneFrame>
    );
  }

  const winnerFontSize = winner.name.length <= 6 ? 56 : winner.name.length <= 9 ? 44 : 34;

  return (
    <PhoneFrame>
      <View style={[styles.pageMain, { backgroundColor: colors.ink }]}>
        <GirihOverlay size={200} opacity={0.05} />

        {/* Winner header */}
        <View style={[styles.header, { borderBottomColor: colors.gold }]}>
          <Text style={[styles.winnerLabel, { color: colors.gold }]}>{t("end.winner")}</Text>
          <Text
            style={[
              styles.winnerName,
              { color: colors.cream, fontSize: winnerFontSize, lineHeight: winnerFontSize * 0.92 },
            ]}
            numberOfLines={1}
          >
            {winner.name}
          </Text>
          {isNewRecord && (
            <Text style={[styles.newRecord, { color: colors.gold }]}>{t("end.newRecord")}</Text>
          )}
          <View style={styles.winnerMeta}>
            <Text style={[styles.winnerPoints, { color: colors.cream }]}>
              {winner.total} {t("end.points")}
            </Text>
            <Text style={[styles.winnerGen, { color: colors.gold }]}>
              {t("end.gen")} {winner.era ? t(`era.${winner.era}` as const) : "—"}
            </Text>
          </View>
        </View>

        {/* Scoreboard */}
        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          <CatalogLine
            left={t("end.perPlayer")}
            right={t("end.playersCount", { n: ranked.length })}
            style={{ marginBottom: 10 }}
          />

          {ranked.map((p, i) => {
            const eraStats = ERAS.map((era) => {
              const ofEra = p.placements.filter((pl) => pl.era === era);
              return {
                era,
                correct: ofEra.filter((pl) => pl.correct).length,
                total: ofEra.length,
              };
            });

            return (
              <View
                key={p.id}
                style={[
                  styles.playerCard,
                  { borderColor: colors.ink3, backgroundColor: i === 0 ? colors.ink2 : "transparent" },
                ]}
              >
                <View style={styles.playerCardTop}>
                  <View style={styles.playerCardLeft}>
                    <Text style={[styles.placeBadge, { color: colors.gold }]}>
                      #{t("end.placeBadge", { n: i + 1 })}
                    </Text>
                    <View style={styles.nameRow}>
                      <Text
                        style={[
                          styles.playerName,
                          { color: colors.cream, opacity: i === 0 ? 1 : 0.85 },
                        ]}
                      >
                        {p.name}
                      </Text>
                      {i === 0 && (
                        <StarMark width={14} height={14} color={colors.gold} />
                      )}
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.playerScore,
                      { color: i === 0 ? colors.gold : colors.cream },
                    ]}
                  >
                    {p.total}
                  </Text>
                </View>

                <View style={styles.eraGrid}>
                  {eraStats.map(({ era, correct, total }) => (
                    <View key={era}>
                      <View style={styles.eraLabelRow}>
                        <Text style={[styles.eraLabel, { color: ERA_COLORS[era].primary }]}>
                          {t(`era.short.${era}` as const)}
                        </Text>
                        <Text style={[styles.eraLabel, { color: colors.cream3 }]}>
                          {correct}/{total || 0}
                        </Text>
                      </View>
                      <View style={styles.eraBar}>
                        {Array.from({ length: Math.max(total, 1) }, (_, j) => (
                          <View
                            key={j}
                            style={[
                              styles.eraBarSegment,
                              {
                                backgroundColor:
                                  j < correct ? ERA_COLORS[era].primary : colors.ink3,
                              },
                            ]}
                          />
                        ))}
                      </View>
                    </View>
                  ))}
                </View>

                {p.era && (
                  <Text style={[styles.bonusGen, { color: ERA_COLORS[p.era].primary }]}>
                    {t("end.bonusGen", { era: t(`era.${p.era}` as const) })}
                  </Text>
                )}
              </View>
            );
          })}
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: colors.gold }]}>
          <YButton variant="ghost" style={{ width: 110 }} onPress={handleShare}>
            {shareLabel ?? t("end.share")}
          </YButton>
          <View style={{ flex: 1 }}>
            <YButton
              onPress={() => {
                reset();
                router.replace("/");
              }}
            >
              {t("end.replay")}
            </YButton>
          </View>
        </View>
      </View>
    </PhoneFrame>
  );
}

const styles = StyleSheet.create({
  emptyMain: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  pageMain: {
    flex: 1,
    overflow: "hidden",
  },
  header: {
    position: "relative",
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    overflow: "hidden",
  },
  winnerLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 10 * 0.26,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  winnerName: {
    fontFamily: fonts.display,
    fontWeight: "900",
    letterSpacing: -1,
    marginTop: 4,
    includeFontPadding: false,
  },
  newRecord: {
    fontFamily: fonts.condensedBold,
    fontSize: 11,
    letterSpacing: 11 * 0.18,
    textTransform: "uppercase",
    marginTop: 4,
    includeFontPadding: false,
  },
  winnerMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 6,
  },
  winnerPoints: {
    fontFamily: fonts.mono,
    fontSize: 16,
    letterSpacing: 16 * 0.14,
    includeFontPadding: false,
  },
  winnerGen: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 11 * 0.14,
    opacity: 0.6,
    includeFontPadding: false,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 14,
  },
  footer: {
    flexDirection: "row",
    gap: 8,
    borderTopWidth: 1,
    padding: 12,
  },
  playerCard: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    position: "relative",
  },
  playerCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  playerCardLeft: {
    gap: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  placeBadge: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 10 * 0.18,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  playerName: {
    fontFamily: fonts.condensedBold,
    fontSize: 18,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 18 * 0.04,
    includeFontPadding: false,
  },
  playerScore: {
    fontFamily: fonts.monoBold,
    fontSize: 28,
    letterSpacing: 28 * -0.02,
    includeFontPadding: false,
  },
  eraGrid: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 6,
  },
  eraLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  eraLabel: {
    fontFamily: fonts.mono,
    fontSize: 8,
    includeFontPadding: false,
  },
  eraBar: {
    flexDirection: "row",
    height: 8,
    gap: 1,
  },
  eraBarSegment: {
    flex: 1,
  },
  bonusGen: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 9 * 0.14,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
});
