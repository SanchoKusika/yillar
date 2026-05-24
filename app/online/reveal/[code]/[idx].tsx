import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { GirihOverlay, Multiplier, PaperGrain, PhoneFrame, YButton } from "@shared/ui";
import {
  useT,
  haptic,
  calcScore,
  ERA_LABEL,
  eraColor,
  CORRECT_THRESHOLD_YEARS,
  sessionStore,
} from "@shared/lib";
import type { Era } from "@shared/lib";
import { useSessionStore } from "@entities/session";
import { getTrackById } from "@entities/track";
import type { Track } from "@entities/track";
import { useRoom, useRoomPlayers, useRoomGuesses, advanceTrack, getRoomGuesses } from "@entities/room";
import type { RoomGuess } from "@entities/room";
import { ERA_COLORS, fonts } from "@theme/tokens";
import Svg, { G, Polygon } from "react-native-svg";

const STAR_POINTS = "0,-30 6,-13 23,-17 12,-4 30,0 12,4 23,17 6,13 0,30 -6,13 -23,17 -12,4 -30,0 -12,-4 -23,-17 -6,-13";

function StarShape({ color, size = 64 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <G transform="translate(32 32)">
        <Polygon fill={color} points={STAR_POINTS} />
      </G>
    </Svg>
  );
}

function StatCell({ label, value, color, align = "flex-start" }: {
  label: string; value: string; color: string; align?: "flex-start" | "center" | "flex-end";
}) {
  return (
    <View style={[styles.statCell, { alignItems: align }]}>
      <Text style={[styles.statCellLabel, { color }]}>{label}</Text>
      <Text style={[styles.statCellValue, { color }]}>{value}</Text>
    </View>
  );
}

export default function OnlineRevealPage() {
  const { code, idx: idxStr } = useLocalSearchParams<{ code: string; idx: string }>();
  const router = useRouter();
  const t = useT();
  const user = useSessionStore((s) => s.user);

  const trackIdx = parseInt(idxStr ?? "0", 10);

  const room = useRoom(code ?? null);
  const players = useRoomPlayers(room?.id ?? null);
  const guesses = useRoomGuesses(room?.id ?? null, trackIdx);
  const myPlayer = players.find((p) => p.playerId === user?.id);
  const isHost = myPlayer?.isHost ?? false;

  const [track, setTrack] = useState<Track | null>(null);
  const [stage, setStage] = useState(0);
  const [allGuesses, setAllGuesses] = useState<RoomGuess[]>([]);
  const [prevTracksMap, setPrevTracksMap] = useState<Map<number, Track>>(new Map());

  useEffect(() => {
    const trackId = room?.trackIds[trackIdx];
    if (!trackId) return;
    void getTrackById(trackId).then(setTrack);
  }, [room?.trackIds, trackIdx]);

  useEffect(() => {
    if (!room?.id) return;
    void getRoomGuesses(room.id).then(setAllGuesses);
  }, [room?.id, trackIdx]);

  useEffect(() => {
    if (!room || trackIdx === 0) { setPrevTracksMap(new Map()); return; }
    const ids = room.trackIds.slice(0, trackIdx);
    void Promise.all(
      ids.map(async (id, i) => {
        const tr = await getTrackById(id);
        return tr ? ([i, tr] as const) : null;
      })
    ).then((entries) => {
      setPrevTracksMap(new Map(entries.filter((e): e is [number, Track] => e !== null)));
    });
  }, [room?.id, trackIdx]);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 400),
      setTimeout(() => setStage(2), 900),
      setTimeout(() => setStage(3), 1350),
      setTimeout(() => setStage(4), 1700),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Escape if room deleted
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!room) router.replace("/online");
    }, 8000);
    return () => clearTimeout(timer);
  }, [room]);

  // Non-hosts: follow host to next screen
  useEffect(() => {
    if (!room) return;
    if (room.status === "ended") {
      router.replace(`/online/end/${code}`);
      return;
    }
    if (room.currentTrackIdx > trackIdx) {
      router.replace(`/online/game/${code}`);
    }
  }, [room?.status, room?.currentTrackIdx, trackIdx, code]);

  const totalTracks = room?.trackIds.length ?? 0;
  const isLastTrack = trackIdx >= totalTracks - 1;

  const handleNext = async () => {
    if (!room || !isHost) return;
    haptic("medium");
    await advanceTrack(room.id, totalTracks, trackIdx);
    if (isLastTrack) {
      router.replace(`/online/end/${code}`);
    } else {
      router.replace(`/online/game/${code}`);
    }
  };

  // Per-player round results, sorted by pts desc
  const roundResults = players
    .map((p) => {
      const g = guesses.find((gx) => gx.playerId === p.playerId);
      if (!g || !p.era || !track) {
        return { player: p, guessYear: null as number | null, roundPts: 0, delta: null as number | null, correct: false };
      }
      const score = calcScore({ guess: g.guessYear, truth: track.year, playerEra: p.era as Era });
      return {
        player: p,
        guessYear: g.guessYear,
        roundPts: score.points,
        delta: score.delta,
        correct: score.delta <= CORRECT_THRESHOLD_YEARS,
      };
    })
    .sort((a, b) => b.roundPts - a.roundPts);

  const playerTotals = new Map<string, number>();
  for (const r of roundResults) {
    let total = r.roundPts;
    for (let i = 0; i < trackIdx; i++) {
      const prevTrack = prevTracksMap.get(i);
      const g = allGuesses.find((gx) => gx.trackIdx === i && gx.playerId === r.player.playerId);
      if (prevTrack && g && r.player.era) {
        total += calcScore({ guess: g.guessYear, truth: prevTrack.year, playerEra: r.player.era as Era }).points;
      }
    }
    playerTotals.set(r.player.playerId, total);
  }

  // Save cumulative scores for the next game screen
  if (room?.id && playerTotals.size > 0) {
    sessionStore.setItem(`yillar:scores:${room.id}`, JSON.stringify(Object.fromEntries(playerTotals)));
  }

  const myResult = roundResults.find((r) => r.player.playerId === user?.id);
  const isPerfect = myResult?.delta === 0;

  const era = (track?.era ?? "klassika") as Era;
  const eraColors = ERA_COLORS[era];

  const bg = isPerfect ? "#D4A847" : eraColors.primary;
  const fg = isPerfect ? "#1A1208" : eraColors.surface;
  const borderCol = isPerfect ? "#1A1208" : eraColors.surface;

  const myMultiplier = myPlayer?.era === era ? 3 : 1;
  const myBase = Math.max(0, 10 - (myResult?.delta ?? 0));

  if (!track) {
    return (
      <PhoneFrame>
        <View style={[styles.loadingCenter, { backgroundColor: "#1A1208" }]}>
          <Text style={[styles.loadingLabel, { color: "#C9BFA6" }]}>{t("online.waitLoading")}</Text>
        </View>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <View style={[styles.root, { backgroundColor: bg }]}>
        {!isPerfect && <PaperGrain opacity={0.35} />}
        <GirihOverlay size={220} opacity={isPerfect ? 0.08 : 0.1} />

        {/* Header */}
        <View style={styles.onlineHeader}>
          <View style={[styles.eraBadge, { borderColor: borderCol }]}>
            <Text style={[styles.eraBadgeText, { color: fg }]}>
              {t(`era.${era}` as const)} · {ERA_LABEL[era]}
            </Text>
          </View>
          <Text
            style={[styles.trackTitle, { color: fg, opacity: stage >= 1 ? 1 : 0 }]}
            numberOfLines={2}
          >
            {track.title}
          </Text>
          <Text style={[styles.artistLine, { color: fg, opacity: 0.75 }]}>{track.artist}</Text>
        </View>

        {/* Year reveal */}
        <View style={[styles.yearSection, { opacity: stage >= 2 ? 1 : 0 }]}>
          {isPerfect ? (
            <View style={styles.perfectYearStage}>
              <View style={styles.perfectBgLayer} pointerEvents="none">
                <StarShape color={fg} size={120} />
              </View>
              <Text style={[styles.yearDisplay, { color: fg }]}>{track.year}</Text>
            </View>
          ) : (
            <View style={styles.standardYear}>
              <Text style={[styles.yearDisplay, { color: fg }]}>{track.year}</Text>
            </View>
          )}
        </View>

        <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
          {/* My stats */}
          {myResult?.guessYear != null && (
            <View style={styles.myStats}>
              {isPerfect ? (
                <>
                  <View style={[styles.stampRow, { opacity: stage >= 2 ? 1 : 0 }]}>
                    <StarShape color={fg} size={20} />
                    <Text style={[styles.stampText, { color: fg }]}>{t("reveal.exactStamp")}</Text>
                    <Text style={[styles.offBy, { color: fg, opacity: 0.7 }]}>{t("reveal.offByZero")}</Text>
                  </View>
                  <View style={[styles.perfectMath, { opacity: stage >= 3 ? 1 : 0 }]}>
                    <Text style={[styles.mathText, { color: fg }]}>
                      {t("reveal.base", { n: myBase })}
                      {myMultiplier > 1 ? ` ${t("reveal.timesEra", { n: myMultiplier })}` : ""}
                      {" "}
                      <Text style={[styles.bonusToken, { color: fg }]}>
                        {t("reveal.bonusExact", { n: myResult.roundPts - myBase * myMultiplier })}
                      </Text>
                    </Text>
                    <Text style={[styles.perfectPoints, { color: fg }]}>+{myResult.roundPts}</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={[styles.multiplierRow, { opacity: stage >= 3 ? 1 : 0 }]}>
                    <Text style={[styles.multiplierLabel, { color: fg }]}>{t("reveal.eraMultiplier")}</Text>
                    <Multiplier n={myMultiplier} />
                  </View>
                  <View style={[styles.statsGrid, { borderTopColor: fg, borderBottomColor: fg, opacity: stage >= 3 ? 1 : 0 }]}>
                    <StatCell label={t("reveal.youGuessed")} value={String(myResult.guessYear)} color={fg} />
                    <StatCell
                      label={t("reveal.offBy")}
                      value={`${myResult.delta} ${t("reveal.years")}`}
                      color={fg}
                      align="center"
                    />
                    <View style={[styles.statCell, { alignItems: "flex-end" }]}>
                      <Text style={[styles.statCellLabel, { color: fg }]}>{t("reveal.points")}</Text>
                      <Text style={[styles.pointsValue, { color: fg, opacity: stage >= 4 ? 1 : 0 }]}>
                        +{myResult.roundPts}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.mathBreakdown, { backgroundColor: eraColors.deep, opacity: stage >= 4 ? 1 : 0 }]}>
                    <Text style={[styles.mathBdText, { color: fg }]}>{t("reveal.base", { n: myBase })}</Text>
                    <Text style={[styles.mathBdText, { color: fg }]}>{t("reveal.timesEra", { n: myMultiplier })}</Text>
                    <Text style={[styles.mathBdText, { color: fg }]}>{t("reveal.equalsPts", { n: myResult.roundPts })}</Text>
                  </View>
                </>
              )}
            </View>
          )}

          {/* Players table */}
          <View style={[styles.tableSection, { opacity: isPerfect ? (stage >= 3 ? 1 : 0) : (stage >= 4 ? 1 : 0) }]}>
            <View style={[styles.tableHeader, { borderBottomColor: `${fg}44` }]}>
              <Text style={[styles.tableHeaderCell, { color: fg, flex: 2 }]}>
                {t("online.revealTitle", { n: trackIdx + 1, m: totalTracks })}
              </Text>
              <Text style={[styles.tableHeaderCell, { color: fg }]}>{t("online.revealDelta")}</Text>
              <Text style={[styles.tableHeaderCell, { color: fg }]}>{t("online.revealRoundPts")}</Text>
              <Text style={[styles.tableHeaderCell, { color: fg }]}>{t("online.revealTotal")}</Text>
            </View>

            {roundResults.map(({ player, guessYear, roundPts, delta }) => {
              const isMe = player.playerId === user?.id;
              return (
                <View
                  key={player.id}
                  style={[
                    styles.tableRow,
                    isMe && { backgroundColor: `${fg}22` },
                    { borderBottomColor: `${fg}22` },
                  ]}
                >
                  <View style={[styles.tablePlayerCell, { flex: 2 }]}>
                    <Text style={[styles.tablePlayerName, { color: fg }]} numberOfLines={1}>
                      {player.name}
                    </Text>
                    {isMe && (
                      <View style={[styles.youBadge, { backgroundColor: isPerfect ? "#1A1208" : eraColors.surface, }]}>
                        <Text style={[styles.youBadgeText, { color: isPerfect ? "#D4A847" : eraColors.primary }]}>
                          {t("online.revealYou")}
                        </Text>
                      </View>
                    )}
                  </View>
                  {guessYear != null ? (
                    <>
                      <Text style={[styles.tableCell, { color: fg, opacity: 0.7 }]}>
                        {delta === 0 ? "★" : `±${delta}`}
                      </Text>
                      <Text style={[styles.tableCell, { color: fg, fontFamily: fonts.monoBold }]}>
                        +{roundPts}
                      </Text>
                      <Text style={[styles.tableCell, { color: fg, fontFamily: fonts.monoBold }]}>
                        {playerTotals.get(player.playerId) ?? 0}
                      </Text>
                    </>
                  ) : (
                    <Text style={[styles.tableCell, { color: fg, opacity: 0.5, flex: 3 }]}>
                      {t("online.waitWaiting")}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: borderCol }]}>
          {isHost ? (
            <YButton variant="era" era={era} onPress={handleNext}>
              {isLastTrack ? t("online.revealFinish") : t("online.revealNext")}
            </YButton>
          ) : (
            <Text style={[styles.waitingText, { color: fg, opacity: 0.7 }]}>
              {t("online.revealWaitHost")}
            </Text>
          )}
        </View>
      </View>
    </PhoneFrame>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loadingCenter: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 10 * 0.18,
    includeFontPadding: false,
  },
  onlineHeader: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 10,
    gap: 6,
  },
  eraBadge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  eraBadgeText: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 9 * 0.18,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  trackTitle: {
    fontFamily: fonts.display,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
    includeFontPadding: false,
  },
  artistLine: {
    fontFamily: fonts.condensed,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 13 * 0.08,
    includeFontPadding: false,
  },
  yearSection: {
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  perfectYearStage: {
    alignItems: "center",
    position: "relative",
  },
  perfectBgLayer: {
    position: "absolute",
    opacity: 0.15,
  },
  standardYear: { gap: 2 },
  yearLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 9 * 0.22,
    includeFontPadding: false,
  },
  yearDisplay: {
    fontFamily: fonts.display,
    fontSize: 56,
    fontWeight: "900",
    letterSpacing: -1,
    includeFontPadding: false,
  },
  scrollBody: { flex: 1 },
  scrollContent: { paddingBottom: 8 },
  myStats: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 6,
  },
  stampRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stampText: {
    fontFamily: fonts.condensedBold,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 13 * 0.12,
    includeFontPadding: false,
  },
  offBy: {
    fontFamily: fonts.mono,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 10 * 0.1,
    includeFontPadding: false,
  },
  perfectMath: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mathText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    includeFontPadding: false,
  },
  bonusToken: {
    fontFamily: fonts.monoBold,
    fontSize: 11,
    includeFontPadding: false,
  },
  perfectPoints: {
    fontFamily: fonts.monoBold,
    fontSize: 22,
    letterSpacing: 22 * -0.02,
    includeFontPadding: false,
  },
  multiplierRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  multiplierLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 10 * 0.1,
    includeFontPadding: false,
  },
  statsGrid: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  statCell: {
    flex: 1,
    gap: 2,
  },
  statCellLabel: {
    fontFamily: fonts.mono,
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 8 * 0.18,
    includeFontPadding: false,
  },
  statCellValue: {
    fontFamily: fonts.monoBold,
    fontSize: 16,
    letterSpacing: 16 * -0.01,
    includeFontPadding: false,
  },
  pointsValue: {
    fontFamily: fonts.monoBold,
    fontSize: 16,
    letterSpacing: 16 * -0.01,
    includeFontPadding: false,
  },
  mathBreakdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  mathBdText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    includeFontPadding: false,
  },
  tableSection: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: "row",
    paddingBottom: 4,
    borderBottomWidth: 1,
    marginBottom: 4,
  },
  tableHeaderCell: {
    flex: 1,
    fontFamily: fonts.mono,
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 8 * 0.18,
    includeFontPadding: false,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    gap: 4,
  },
  tablePlayerCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: 0,
  },
  tablePlayerName: {
    fontFamily: fonts.condensed,
    fontSize: 12,
    textTransform: "uppercase",
    flex: 1,
    includeFontPadding: false,
  },
  youBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  youBadgeText: {
    fontFamily: fonts.mono,
    fontSize: 7,
    textTransform: "uppercase",
    letterSpacing: 7 * 0.14,
    includeFontPadding: false,
  },
  tableCell: {
    flex: 1,
    fontFamily: fonts.mono,
    fontSize: 11,
    textAlign: "center",
    includeFontPadding: false,
  },
  footer: {
    padding: 12,
    borderTopWidth: 1,
  },
  waitingText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 10 * 0.14,
    textAlign: "center",
    includeFontPadding: false,
  },
});
