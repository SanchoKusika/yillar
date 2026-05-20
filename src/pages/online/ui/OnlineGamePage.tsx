import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { PhoneFrame, YButton } from "@shared/ui";
import { useT, useYouTubeAudio, haptic, calcScore, eraForYear, CORRECT_THRESHOLD_YEARS } from "@shared/lib";
import { useSessionStore } from "@entities/session";
import { getTrackById } from "@entities/track";
import type { Track } from "@entities/track";
import type { Placement } from "@entities/placement";
import { useRoom, useRoomPlayers, useRoomGuesses, getRoomGuesses, submitGuess } from "@entities/room";
import { SongCard } from "@widgets/song-card";
import { AudioStrip } from "@widgets/audio-strip";
import { Timeline } from "@widgets/timeline";
import styles from "./OnlineGamePage.module.css";

const TURN_SECONDS = 60;

export function OnlineGamePage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const t = useT();
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
    void getTrackById(currentTrackId).then((t) => setTrack(t));
  }, [currentTrackId]);

  const guesses = useRoomGuesses(room?.id ?? null, trackIdx);
  const myGuess = guesses.find((g) => g.playerId === user?.id);
  const hasSubmitted = myGuess != null;

  const [pastPlacements, setPastPlacements] = useState<Placement[]>([]);
  useEffect(() => {
    if (!room || !user || !myPlayer || trackIdx === 0) { setPastPlacements([]); return; }
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
          const track = tracks[i];
          if (!track) return [];
          const score = calcScore({ guess: g.guessYear, truth: track.year, playerEra });
          return [{
            trackId: track.id,
            guess: g.guessYear,
            truth: track.year,
            era: eraForYear(track.year),
            title: track.title,
            correct: score.delta <= CORRECT_THRESHOLD_YEARS,
            ...score,
          }];
        })
      );
    })();
    return () => { active = false; };
  }, [trackIdx, room?.id, user?.id, myPlayer?.era]);

  const [guess, setGuess] = useState(1990);

  // Previous-round leaderboard: saved by reveal page into sessionStorage
  const prevScores = useMemo<Record<string, number>>(() => {
    if (trackIdx === 0 || !room?.id) return {};
    const stored = sessionStorage.getItem(`yillar:scores:${room.id}`);
    if (!stored) return (location.state as { scores?: Record<string, number> } | null)?.scores ?? {};
    try { return JSON.parse(stored) as Record<string, number>; } catch { return {}; }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackIdx, room?.id]);

  const sortedLeaderboard = useMemo(() => {
    if (!Object.keys(prevScores).length) return [];
    return [...players]
      .map((p) => ({ name: p.name, score: prevScores[p.playerId] ?? 0 }))
      .sort((a, b) => b.score - a.score);
  }, [players, prevScores]);

  // ── Timer ──────────────────────────────────────────────────────────────────
  const [timeLeft, setTimeLeft] = useState(TURN_SECONDS);
  const autoSubmittedRef = useRef(false);

  // Reset timer + guess when track changes
  useEffect(() => {
    setTimeLeft(TURN_SECONDS);
    setGuess(1990);
    autoSubmittedRef.current = false;
  }, [currentTrackId]);

  // Countdown — stops when submitted
  useEffect(() => {
    if (hasSubmitted) return;
    const id = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [hasSubmitted, currentTrackId]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft > 0 || hasSubmitted || autoSubmittedRef.current || !room || !user) return;
    autoSubmittedRef.current = true;
    haptic("light");
    audio.pause();
    void submitGuess(room.id, trackIdx, user.id, guess);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);
  // ──────────────────────────────────────────────────────────────────────────

  const audio = useYouTubeAudio(track?.youtubeId ?? undefined);

  // Redirect to lobby if room not found after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!room) navigate("/online", { replace: true });
    }, 8000);
    return () => clearTimeout(timer);
  }, [room, navigate]);

  // When all players submitted → go to reveal
  useEffect(() => {
    if (!room || players.length === 0 || guesses.length === 0) return;
    if (guesses.length >= players.length) {
      navigate(`/online/reveal/${code}/${trackIdx}`);
    }
  }, [guesses.length, players.length, code, trackIdx, room, navigate]);

  // When room ends
  useEffect(() => {
    if (room?.status === "ended") {
      navigate(`/online/end/${code}`, { replace: true });
    }
  }, [room?.status, code, navigate]);

  const onLockIn = async () => {
    if (!room || !user || hasSubmitted) return;
    haptic("medium");
    audio.pause();
    await submitGuess(room.id, trackIdx, user.id, guess);
  };

  // Timer colour: gold → orange → red
  const timerColor =
    timeLeft <= 10 ? "#e74c3c" :
    timeLeft <= 20 ? "#e67e22" :
    "var(--color-gold)";
  const timerPct = (timeLeft / TURN_SECONDS) * 100;

  return (
    <PhoneFrame>
      {(!track || !myPlayer) ? (
        <div className="flex h-full items-center justify-center">
          <span className={styles.loadingLabel}>{t("online.waitLoading")}</span>
        </div>
      ) : (
        <main className="relative flex h-full flex-col overflow-hidden">
          <div className={styles.header}>
            <span className={styles.cardProgress}>
              {t("game.cardOf", { idx: trackIdx + 1, total: totalTracks })}
            </span>
            <span className={styles.playerName}>{myPlayer.name}</span>
          </div>

          {/* Timer bar */}
          {!hasSubmitted && (
            <div className={styles.timerBarWrap}>
              <div
                className={styles.timerBar}
                style={{ width: `${timerPct}%`, background: timerColor }}
              />
            </div>
          )}

          {sortedLeaderboard.length > 0 && (
            <div className={styles.scoresBar}>
              {sortedLeaderboard.map((entry, i) => (
                <div key={entry.name} className={styles.scoreChip}>
                  <span className={styles.scoreRank}>#{i + 1}</span>
                  <span className={styles.scoreName}>{entry.name}</span>
                  <span className={styles.scoreValue}>{entry.score}</span>
                </div>
              ))}
            </div>
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

          <footer className="border-t border-gold bg-ink">
            {hasSubmitted ? (
              <div className={styles.waitingFooter}>
                <span className={styles.waitingLabel}>
                  {t("online.gameWaiting", { n: guesses.length, m: players.length })}
                </span>
                <div className={styles.waitingPips}>
                  {players.map((_, i) => (
                    <span
                      key={i}
                      className={i < guesses.length ? styles.pipDone : styles.pip}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3">
                <YButton onClick={onLockIn}>
                  {t("game.lockIn", { year: guess })}
                </YButton>
              </div>
            )}
          </footer>
        </main>
      )}
      <audio.PlayerHost />
    </PhoneFrame>
  );
}
