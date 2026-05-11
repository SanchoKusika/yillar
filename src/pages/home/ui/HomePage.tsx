import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GirihOverlay, PhoneFrame, Wordmark, YButton } from "@shared/ui";
import { env } from "@shared/config";
import { useT, haptic } from "@shared/lib";
import { useGameStore } from "@entities/game";
import { useSessionStore } from "@entities/session";
import { useTracks } from "@entities/track";
import { PlayerRoster } from "@widgets/player-roster";
import { BottomNav } from "@widgets/bottom-nav";
import styles from "./HomePage.module.css";

export function HomePage() {
  const navigate = useNavigate();
  const t = useT();
  const players = useGameStore((s) => s.players);
  const setPlayerName = useGameStore((s) => s.setPlayerName);
  const setPlayerEra = useGameStore((s) => s.setPlayerEra);
  const startGame = useGameStore((s) => s.startGame);
  const profile = useSessionStore((s) => s.profile);
  const user = useSessionStore((s) => s.user);
  const isRegistered = user !== null && !user.isAnonymous;
  const hostLockedAt = isRegistered && profile?.displayName ? 0 : null;

  useEffect(() => {
    if (!isRegistered) return;
    if (profile?.displayName) {
      const expected = profile.displayName.toUpperCase().slice(0, 12);
      if (players[0].name !== expected) setPlayerName(0, profile.displayName);
    }
    if (profile?.generation && players[0].era !== profile.generation) {
      setPlayerEra(0, profile.generation);
    }
  }, [isRegistered, profile?.displayName, profile?.generation, players, setPlayerName, setPlayerEra]);

  const { data: tracks, isLoading, isError } = useTracks(12);

  const named = players.filter((p) => p.name);
  const activeCount = named.length;
  const canStart = activeCount >= 2 && named.every((p) => p.era) && (tracks?.length ?? 0) > 0;

  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      navigate("/game");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, navigate]);

  const onBegin = () => {
    if (!canStart || !tracks) return;
    startGame(tracks);
    haptic("medium");
    setCountdown(3);
  };

  const buttonLabel = (() => {
    if (isLoading) return t("home.button.loading");
    if (isError) return t("home.button.failed");
    if (activeCount < 2) return t("home.button.needPlayers");
    if (!named.every((p) => p.era)) return t("home.button.pickGenerations");
    return t("home.button.begin", { n: activeCount });
  })();

  return (
    <PhoneFrame>
      <div className="relative flex h-full flex-col">
        {countdown !== null && countdown > 0 && (
          <div className={styles.countOverlay}>
            <div key={countdown} className={styles.countNum}>{countdown}</div>
          </div>
        )}
        <GirihOverlay size={200} opacity={0.05} />

        <header className="relative px-5 pt-6 pb-[18px] text-center">
          <div className="inline-block">
            <Wordmark color="var(--color-gold)" size={56} />
          </div>
          <div className="mt-3 font-condensed text-[10px] font-bold uppercase tracking-[0.32em] text-cream opacity-75">
            {t("tagline")}
          </div>
        </header>

        <div className="h-px bg-gold/50" />

        <div className="relative flex-1 overflow-auto">
          <PlayerRoster players={players} onName={setPlayerName} onEra={setPlayerEra} hostLockedAt={hostLockedAt} />
        </div>

        <footer className="border-t border-gold bg-ink p-[14px]">
          <YButton disabled={!canStart} onClick={onBegin}>
            {buttonLabel}
          </YButton>
        </footer>

        <BottomNav />
      </div>
    </PhoneFrame>
  );
}
