import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { PhoneFrame, YButton } from "@shared/ui";
import {
  useT,
  useYouTubeAudio,
  haptic,
  calcScore,
  eraForYear,
  CORRECT_THRESHOLD_YEARS,
  sessionStore,
} from "@shared/lib";
import { useSessionStore } from "@entities/session";
import { getTrackById } from "@entities/track";
import type { Track } from "@entities/track";
import type { Placement } from "@entities/placement";
import { useRoom, useRoomPlayers, useRoomGuesses, getRoomGuesses, submitGuess } from "@entities/room";
import { SongCard } from "@features/game/SongCard";
import { AudioStrip } from "@features/game/AudioStrip";
import { Timeline } from "@features/game/Timeline";
import { useTheme } from "@theme";
import { fonts } from "@theme/tokens";

const TURN_SECONDS = 60;

export default function OnlineGamePage() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const t = useT();
  const { colors } = useTheme();
  const user = useSessionStore((s) => s.user);

  const room = useRoom(code ?? null);
  const players = useRoomPlayers(room?.id ?? null);
  const myPlayer = players.find((p) => p.playerId === user?.id);

  const trackIdx = room?.currentTrackIdx ?? 0;
  const totalTracks = room?.trackIds.length ?? 0;
  const currentTrackId = room?.trackIds[trackIdx] ?? null;

  const [track, setTrack] = useState<Track | null>(null);
  useEffect(() => {
    if (!currentTrackId) return;
    setTrack(null);
    void getTrackById(currentTrackId).then((tr) => setTrack(tr));
  }, [currentTrackId]);

  const guesses = useRoomGuesses(room?.id ?? null, trackIdx);
  const myGuess = guesses.find((g) => g.playerId === user?.id);
  const hasSubmitted = myGuess != null;

  const [pastPlacements, setPastPlacements] = useState<Placement[]>([]);
  useEffect(() => {
    if (!room || !user || !myPlayer || trackIdx === 0) {
      setPastPlacements([]);
      return;
    }
    let active = true;
    void (async () => {
      const allGuesses = await getRoomGuesses(room.id);
      const mine = allGuesses
        .filter((g) => g.playerId === user.id && g.trackIdx < trackIdx)
        .sort((a, b) => a.trackIdx - b.trackIdx);
      const tracks = await Promise.all(mine.map((g) => getTrackById(room.trackIds[g.trackIdx])));
      if (!active) return;
      const playerEra = myPlayer.era ?? "kasseta";
      setPastPlacements(
        mine.flatMap((g, i) => {
          const tr = tracks[i];
          if (!tr) return [];
          const score = calcScore({ guess: g.guessYear, truth: tr.year, playerEra: playerEra as "klassika" | "kasseta" | "tsifra" });
          return [{
            trackId: tr.id,
            guess: g.guessYear,
            truth: tr.year,
            era: eraForYear(tr.year),
            title: tr.title,
            artist: tr.artist,
            correct: score.delta <= CORRECT_THRESHOLD_YEARS,
            ...score,
          }];
        }),
      );
    })();
    return () => { active = false; };
  }, [trackIdx, room?.id, user?.id, myPlayer?.era]);

  const [guess, setGuess] = useState(1990);

  // Leaderboard from previous reveal (saved via sessionStore by OnlineRevealPage)
  const prevScores = useMemo<Record<string, number>>(() => {
    if (trackIdx === 0 || !room?.id) return {};
    const stored = sessionStore.getItem(`yillar:scores:${room.id}`);
    if (!stored) return {};
    try { return JSON.parse(stored) as Record<string, number>; } catch { return {}; }
  }, [trackIdx, room?.id]);

  const sortedLeaderboard = useMemo(() => {
    if (!Object.keys(prevScores).length) return [];
    return [...players]
      .map((p) => ({ name: p.name, score: prevScores[p.playerId] ?? 0 }))
      .sort((a, b) => b.score - a.score);
  }, [players, prevScores]);

  // Timer
  const [timeLeft, setTimeLeft] = useState(TURN_SECONDS);
  const autoSubmittedRef = useRef(false);

  useEffect(() => {
    setTimeLeft(TURN_SECONDS);
    setGuess(1990);
    autoSubmittedRef.current = false;
  }, [currentTrackId]);

  useEffect(() => {
    if (hasSubmitted) return;
    const id = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [hasSubmitted, currentTrackId]);

  // Auto-submit when time runs out
  const audioRef = useRef<ReturnType<typeof useYouTubeAudio> | null>(null);
  useEffect(() => {
    if (timeLeft > 0 || hasSubmitted || autoSubmittedRef.current || !room || !user) return;
    autoSubmittedRef.current = true;
    haptic("light");
    audioRef.current?.pause();
    void submitGuess(room.id, trackIdx, user.id, guess);
  }, [timeLeft]);

  const audio = useYouTubeAudio(track?.youtubeId ?? undefined);
  audioRef.current = audio;

  // Escape if room gone
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!room) router.replace("/online");
    }, 8000);
    return () => clearTimeout(timer);
  }, [room]);

  // All players submitted → go to reveal
  useEffect(() => {
    if (!room || players.length === 0 || guesses.length === 0) return;
    if (guesses.length >= players.length) {
      router.push(`/online/reveal/${code}/${trackIdx}`);
    }
  }, [guesses.length, players.length, code, trackIdx, room]);

  // Room ended
  useEffect(() => {
    if (room?.status === "ended") {
      router.replace(`/online/end/${code}`);
    }
  }, [room?.status, code]);

  const onLockIn = async () => {
    if (!room || !user || hasSubmitted) return;
    haptic("medium");
    audio.pause();
    await submitGuess(room.id, trackIdx, user.id, guess);
  };

  const timerColor =
    timeLeft <= 10 ? "#e74c3c" :
    timeLeft <= 20 ? "#e67e22" :
    colors.gold;
  const timerPct = (timeLeft / TURN_SECONDS) * 100;

  if (!track || !myPlayer) {
    return (
      <PhoneFrame>
        <View style={[styles.loadingCenter, { backgroundColor: colors.ink }]}>
          <Text style={[styles.loadingLabel, { color: colors.cream3 }]}>{t("online.waitLoading")}</Text>
        </View>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <View style={[styles.main, { backgroundColor: colors.ink }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.ink, borderBottomColor: colors.ink3 }]}>
          <Text style={[styles.cardProgress, { color: colors.cream3 }]}>
            {t("game.cardOf", { idx: trackIdx + 1, total: totalTracks })}
          </Text>
          <Text style={[styles.playerName, { color: colors.cream }]}>{myPlayer.name}</Text>
        </View>

        {/* Timer bar */}
        {!hasSubmitted && (
          <View style={[styles.timerBarWrap, { backgroundColor: colors.ink3 }]}>
            <View style={[styles.timerBar, { width: `${timerPct}%` as `${number}%`, backgroundColor: timerColor }]} />
          </View>
        )}

        {/* Leaderboard strip */}
        {sortedLeaderboard.length > 0 && (
          <View style={[styles.scoresBar, { backgroundColor: colors.ink2, borderBottomColor: colors.ink3 }]}>
            {sortedLeaderboard.map((entry, i) => (
              <View key={entry.name} style={styles.scoreChip}>
                <Text style={[styles.scoreRank, { color: colors.cream3 }]}>#{i + 1}</Text>
                <Text style={[styles.scoreName, { color: colors.cream }]} numberOfLines={1}>
                  {entry.name}
                </Text>
                <Text style={[styles.scoreValue, { color: colors.gold }]}>{entry.score}</Text>
              </View>
            ))}
          </View>
        )}

        <SongCard
          title={track.title}
          artist={track.artist}
          cardIdx={trackIdx}
          totalCards={totalTracks}
        />

        <AudioStrip
          playing={audio.isPlaying}
          progress={audio.progress}
          timeLabel={audio.timeLabel}
          onToggle={audio.toggle}
        />

        <Timeline
          playerName={myPlayer.name}
          placements={pastPlacements}
          guessYear={guess}
          onGuessChange={hasSubmitted ? () => {} : setGuess}
        />

        <View style={[styles.footer, { borderTopColor: colors.gold, backgroundColor: colors.ink }]}>
          {hasSubmitted ? (
            <View style={styles.waitingFooter}>
              <Text style={[styles.waitingLabel, { color: colors.cream3 }]}>
                {t("online.gameWaiting", { n: guesses.length, m: players.length })}
              </Text>
              <View style={styles.waitingPips}>
                {players.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.pip,
                      { backgroundColor: i < guesses.length ? colors.gold : colors.ink3 },
                    ]}
                  />
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.lockInPad}>
              <YButton onPress={onLockIn}>
                {t("game.lockIn", { year: guess })}
              </YButton>
            </View>
          )}
        </View>
      </View>

      <audio.PlayerHost />
    </PhoneFrame>
  );
}

const styles = StyleSheet.create({
  loadingCenter: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 10 * 0.18,
    includeFontPadding: false,
  },
  main: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  cardProgress: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 10 * 0.14,
    includeFontPadding: false,
  },
  playerName: {
    fontFamily: fonts.condensedBold,
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 14 * 0.08,
    includeFontPadding: false,
  },
  timerBarWrap: {
    height: 3,
    width: "100%",
  },
  timerBar: {
    height: 3,
  },
  scoresBar: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    gap: 8,
  },
  scoreChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: 0,
  },
  scoreRank: {
    fontFamily: fonts.mono,
    fontSize: 8,
    includeFontPadding: false,
  },
  scoreName: {
    fontFamily: fonts.condensed,
    fontSize: 10,
    textTransform: "uppercase",
    flex: 1,
    includeFontPadding: false,
  },
  scoreValue: {
    fontFamily: fonts.monoBold,
    fontSize: 12,
    includeFontPadding: false,
  },
  footer: {
    borderTopWidth: 1,
  },
  lockInPad: { padding: 12 },
  waitingFooter: {
    padding: 12,
    alignItems: "center",
    gap: 8,
  },
  waitingLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 10 * 0.14,
    includeFontPadding: false,
  },
  waitingPips: {
    flexDirection: "row",
    gap: 6,
  },
  pip: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
