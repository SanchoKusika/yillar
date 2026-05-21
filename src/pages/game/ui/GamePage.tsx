import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneFrame, YButton } from "@shared/ui";
import { useT, useYouTubeAudio, haptic } from "@shared/lib";
import styles from "./GamePage.module.css";
import {
  useGameStore,
  useActivePlayers,
  useCurrentPlayer,
  useCurrentTrack,
  useMyPlacements,
} from "@entities/game";
import { ScoreboardBar } from "@widgets/scoreboard-bar";
import { SongCard } from "@widgets/song-card";
import { AudioStrip } from "@widgets/audio-strip";
import { Timeline } from "@widgets/timeline";

export function GamePage() {
  const navigate = useNavigate();
  const t = useT();
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
    if (status === "lobby") navigate("/", { replace: true });
    else if (status === "ended") navigate("/end", { replace: true });
  }, [status, navigate]);

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
    // new random position each card
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
    if (result) navigate("/reveal");
  };

  const onSkip = () => {
    audio.pause();
    haptic("light");
    const result = skipTurn();
    if (result) navigate("/reveal");
  };

  return (
    <PhoneFrame>
      <main className={styles.main}>
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

        <footer className={styles.footer}>
          <YButton variant="ghost" style={{ width: 110, flexShrink: 0 }} onClick={onSkip}>
            {t("game.skip")}
          </YButton>
          <YButton onClick={onLock}>{t("game.lockIn", { year: guessYear })}</YButton>
        </footer>

        <audio.PlayerHost />
      </main>
    </PhoneFrame>
  );
}
