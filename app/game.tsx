import { useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { PhoneFrame, YButton } from "@shared/ui";
import { useT, useYouTubeAudio, haptic } from "@shared/lib";
import {
  useGameStore,
  useActivePlayers,
  useCurrentPlayer,
  useCurrentTrack,
  useMyPlacements,
} from "@entities/game";
import { ScoreboardBar } from "@features/game/ScoreboardBar";
import { SongCard } from "@features/game/SongCard";
import { AudioStrip } from "@features/game/AudioStrip";
import { Timeline } from "@features/game/Timeline";
import { useTheme } from "@theme";

export default function GamePage() {
  const router = useRouter();
  const t = useT();
  const { colors } = useTheme();

  const status = useGameStore((s) => s.status);
  const currentCardIdx = useGameStore((s) => s.currentCardIdx);
  const totalCards = useGameStore((s) => s.totalCards);
  const scores = useGameStore((s) => s.scores);
  const guess = useGameStore((s) => s.currentGuess);
  const setGuess = useGameStore((s) => s.setGuess);
  const lockIn = useGameStore((s) => s.lockIn);
  const skipTurn = useGameStore((s) => s.skipTurn);

  const activePlayers = useActivePlayers();
  const currentPlayer = useCurrentPlayer();
  const currentTrack = useCurrentTrack();
  const myPlacements = useMyPlacements();

  const audio = useYouTubeAudio(currentTrack?.youtubeId);

  useEffect(() => {
    if (status === "lobby") router.replace("/");
    else if (status === "ended") router.replace("/end");
  }, [status, router]);

  const entries = useMemo(
    () =>
      activePlayers.map((p) => ({
        id: p.id,
        name: p.name,
        score: scores[p.id] ?? 0,
        turn: p.id === currentPlayer?.id,
      })),
    [activePlayers, scores, currentPlayer?.id],
  );

  const defaultYear = useMemo(
    () => Math.floor(Math.random() * (2025 - 1960 + 1)) + 1960,
    // new random position per card
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentCardIdx],
  );

  if (!currentTrack || !currentPlayer) return null;

  const guessYear = guess ?? defaultYear;

  const onLock = () => {
    audio.pause();
    if (guess == null) setGuess(guessYear);
    haptic("medium");
    const result = lockIn();
    if (result) router.push("/reveal");
  };

  const onSkip = () => {
    audio.pause();
    haptic("light");
    const result = skipTurn();
    if (result) router.push("/reveal");
  };

  return (
    <PhoneFrame>
      <View style={[styles.main, { backgroundColor: colors.ink }]}>
        <ScoreboardBar
          currentName={currentPlayer.name}
          cardIdx={currentCardIdx}
          totalCards={totalCards}
          entries={entries}
        />

        <SongCard
          title={currentTrack.title}
          artist={currentTrack.artist}
          cardIdx={currentCardIdx}
          totalCards={totalCards}
        />

        <AudioStrip
          playing={audio.isPlaying}
          progress={audio.progress}
          timeLabel={audio.timeLabel}
          onToggle={audio.toggle}
        />

        <Timeline
          playerName={currentPlayer.name}
          placements={myPlacements}
          guessYear={guessYear}
          onGuessChange={setGuess}
        />

        <View style={[styles.footer, { borderTopColor: colors.ink3 }]}>
          <YButton variant="ghost" style={{ width: 110 }} onPress={onSkip}>
            {t("game.skip")}
          </YButton>
          <View style={{ flex: 1 }}>
            <YButton onPress={onLock}>{t("game.lockIn", { year: guessYear })}</YButton>
          </View>
        </View>

        <audio.PlayerHost />
      </View>
    </PhoneFrame>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    gap: 8,
    padding: 14,
    borderTopWidth: 1,
  },
});
