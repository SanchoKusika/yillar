import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CatalogLine, GirihOverlay, PhoneFrame, YButton } from "@shared/ui";
import { useT, haptic, calcScore, ERAS, eraColor, CORRECT_THRESHOLD_YEARS } from "@shared/lib";
import type { Era } from "@shared/lib";
import { useSessionStore } from "@entities/session";
import { getTrackById } from "@entities/track";
import type { Track } from "@entities/track";
import type { Placement } from "@entities/placement";
import { useRoom, useRoomPlayers, getRoomGuesses, resetRoom } from "@entities/room";
import { saveGame } from "@features/save-game/api/saveGame";
import { useProfileStats } from "@entities/game-history";
import { BottomNav } from "@features/navigation/BottomNav";
import { ERA_COLORS, fonts } from "@theme/tokens";
import { useTheme } from "@theme";
import StarMark from "@shared/assets/svg/star-mark.svg";

type PlayerResult = {
  playerId: string;
  name: string;
  era: Era | null;
  isHost: boolean;
  totalPts: number;
  placements: Placement[];
};

export default function OnlineEndPage() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const t = useT();
  const { colors } = useTheme();
  const user = useSessionStore((s) => s.user);
  const profile = useSessionStore((s) => s.profile);

  const room = useRoom(code ?? null);
  const players = useRoomPlayers(room?.id ?? null);
  const myPlayer = players.find((p) => p.playerId === user?.id);

  const [results, setResults] = useState<PlayerResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [rematching, setRematching] = useState(false);
  const [waitingRematch, setWaitingRematch] = useState(false);
  const savedRef = useRef(false);

  const stats = useProfileStats(user?.id);

  // Non-hosts: follow host back to waiting room on rematch
  useEffect(() => {
    if (room?.status === "waiting") {
      router.replace(`/online/room/${code}`);
    }
  }, [room?.status, code]);

  useEffect(() => {
    if (!room || players.length === 0) return;

    const compute = async () => {
      const allGuesses = await getRoomGuesses(room.id);

      const trackMap = new Map<string, Track>();
      await Promise.all(
        room.trackIds.map(async (id) => {
          const tr = await getTrackById(id);
          if (tr) trackMap.set(id, tr);
        })
      );

      const playerResults: PlayerResult[] = players.map((p) => {
        const placements: Placement[] = [];

        for (let idx = 0; idx < room.trackIds.length; idx++) {
          const trackId = room.trackIds[idx];
          const track = trackId ? trackMap.get(trackId) : undefined;
          const guess = allGuesses.find((g) => g.trackIdx === idx && g.playerId === p.playerId);
          if (!track || !guess || !p.era) continue;

          const score = calcScore({ guess: guess.guessYear, truth: track.year, playerEra: p.era as Era });
          placements.push({
            trackId: track.id,
            guess: guess.guessYear,
            truth: track.year,
            delta: score.delta,
            base: score.base,
            multiplier: score.multiplier,
            bonus: score.bonus,
            points: score.points,
            era: track.era,
            title: track.title,
            artist: track.artist,
            correct: score.delta <= CORRECT_THRESHOLD_YEARS,
            skipped: false,
          });
        }

        const totalPts = placements.reduce((sum, pl) => sum + pl.points, 0);
        return { playerId: p.playerId, name: p.name, era: p.era as Era | null, isHost: p.isHost, totalPts, placements };
      });

      const ranked = playerResults.sort((a, b) => b.totalPts - a.totalPts);
      setResults(ranked);
      setLoading(false);

      if (myPlayer?.isHost && !savedRef.current && user) {
        savedRef.current = true;
        const hostName = profile?.displayName?.toUpperCase() || myPlayer.name;
        void saveGame({
          hostId: user.id,
          totalCards: room.trackIds.length,
          players: ranked.map((r, i) => ({
            displayName: r.isHost ? hostName : r.name,
            generation: r.era,
            totalScore: r.totalPts,
            rank: i + 1,
            isWinner: i === 0,
            isHost: r.isHost,
            placements: r.placements,
          })),
        }).catch(() => { savedRef.current = false; });
      }
    };

    void compute();
  }, [room?.id, players.length]);

  const winner = results[0];
  const isNewRecord =
    winner?.playerId === user?.id &&
    stats.data?.bestScore != null &&
    winner.totalPts > stats.data.bestScore;

  const winnerFontSize = winner ? (winner.name.length <= 6 ? 56 : winner.name.length <= 9 ? 44 : 34) : 44;

  return (
    <PhoneFrame>
      <View style={[styles.root, { backgroundColor: colors.ink }]}>
        <GirihOverlay size={200} opacity={0.05} />

        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.gold }]}>
          {loading ? (
            <Text style={[styles.loadingLabel, { color: colors.cream3 }]}>{t("online.waitLoading")}</Text>
          ) : winner ? (
            <>
              <Text style={[styles.winnerLabel, { color: colors.gold }]}>{t("end.winner")}</Text>
              <Text
                style={[styles.winnerName, { color: colors.cream, fontSize: winnerFontSize, lineHeight: winnerFontSize * 0.92 }]}
                numberOfLines={1}
              >
                {winner.name}
              </Text>
              {isNewRecord && (
                <Text style={[styles.newRecord, { color: colors.gold }]}>{t("end.newRecord")}</Text>
              )}
              <View style={styles.winnerMeta}>
                <Text style={[styles.winnerPoints, { color: colors.cream }]}>
                  {winner.totalPts} {t("end.points")}
                </Text>
                <Text style={[styles.winnerGen, { color: colors.gold }]}>
                  {t("end.gen")} {winner.era ? t(`era.${winner.era}` as const) : "—"}
                </Text>
              </View>
            </>
          ) : null}
        </View>

        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          {!loading && (
            <>
              <CatalogLine
                left={t("end.perPlayer")}
                right={t("end.playersCount", { n: results.length })}
                style={{ marginBottom: 10 }}
              />

              {results.map((r, i) => {
                const isMe = r.playerId === user?.id;
                const eraStats = ERAS.map((era) => {
                  const ofEra = r.placements.filter((pl) => pl.era === era);
                  return { era, correct: ofEra.filter((pl) => pl.correct).length, total: ofEra.length };
                });

                return (
                  <View
                    key={r.playerId}
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
                            style={[styles.playerName, { color: colors.cream, opacity: i === 0 ? 1 : 0.85 }]}
                          >
                            {r.name}
                          </Text>
                          {isMe && (
                            <View style={[styles.youBadge, { borderColor: colors.ink3 }]}>
                              <Text style={[styles.youBadgeText, { color: colors.cream3 }]}>
                                {t("online.revealYou")}
                              </Text>
                            </View>
                          )}
                          {i === 0 && <StarMark width={14} height={14} color={colors.gold} />}
                        </View>
                      </View>
                      <Text style={[styles.playerScore, { color: i === 0 ? colors.gold : colors.cream }]}>
                        {r.totalPts}
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
                                  { backgroundColor: j < correct ? ERA_COLORS[era].primary : colors.ink3 },
                                ]}
                              />
                            ))}
                          </View>
                        </View>
                      ))}
                    </View>

                    {r.era && (
                      <Text style={[styles.bonusGen, { color: ERA_COLORS[r.era].primary }]}>
                        {t("end.bonusGen", { era: t(`era.${r.era}` as const) })}
                      </Text>
                    )}
                  </View>
                );
              })}
            </>
          )}
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: colors.gold }]}>
          <YButton
            variant="ghost"
            style={{ width: 110 }}
            onPress={() => {
              haptic("light");
              router.replace("/");
            }}
          >
            {t("online.endBack")}
          </YButton>

          <View style={{ flex: 1 }}>
            {waitingRematch ? (
              <View style={styles.waitingRematch}>
                <Text style={[styles.waitingText, { color: colors.cream3 }]}>{t("online.waitWaiting")}</Text>
              </View>
            ) : (
              <YButton
                disabled={rematching}
                onPress={async () => {
                  haptic("medium");
                  if (myPlayer?.isHost && room) {
                    setRematching(true);
                    await resetRoom(room.id);
                    router.replace(`/online/room/${code}`);
                  } else {
                    setWaitingRematch(true);
                  }
                }}
              >
                {t("online.endPlayAgain")}
              </YButton>
            )}
          </View>
        </View>

        <BottomNav />
      </View>
    </PhoneFrame>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loadingLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 10 * 0.18,
    includeFontPadding: false,
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
  body: { flex: 1 },
  bodyContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 14,
  },
  playerCard: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  playerCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  playerCardLeft: { gap: 2 },
  placeBadge: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 10 * 0.18,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  playerName: {
    fontFamily: fonts.condensedBold,
    fontSize: 18,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 18 * 0.04,
    includeFontPadding: false,
  },
  youBadge: {
    borderWidth: 1,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  youBadgeText: {
    fontFamily: fonts.mono,
    fontSize: 7,
    textTransform: "uppercase",
    letterSpacing: 7 * 0.14,
    includeFontPadding: false,
  },
  playerScore: {
    fontFamily: fonts.monoBold,
    fontSize: 28,
    letterSpacing: 28 * -0.02,
    includeFontPadding: false,
  },
  eraGrid: { flexDirection: "row", gap: 4, marginBottom: 6 },
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
  eraBar: { flexDirection: "row", height: 8, gap: 1 },
  eraBarSegment: { flex: 1 },
  bonusGen: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 9 * 0.14,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  footer: {
    flexDirection: "row",
    gap: 8,
    borderTopWidth: 1,
    padding: 12,
  },
  waitingRematch: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  waitingText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 10 * 0.14,
    includeFontPadding: false,
  },
});
