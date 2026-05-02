import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CatalogLine, GirihOverlay, PhoneFrame, Wordmark, YButton } from "@shared/ui";
import { env } from "@shared/config";
import { useT } from "@shared/lib";
import { useGameStore } from "@entities/game";
import { useSessionStore } from "@entities/session";
import { useTracks } from "@entities/track";
import { PlayerRoster } from "@widgets/player-roster";
import { BottomNav } from "@widgets/bottom-nav";

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

  const onBegin = () => {
    if (!canStart || !tracks) return;
    startGame(tracks);
    navigate("/game");
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
        <GirihOverlay size={200} opacity={0.05} />

        <div className="relative border-b border-gold px-[18px] py-[14px]">
          <CatalogLine
            left={t("home.headerLeft")}
            right={env.hasSupabase ? t("home.live") : t("home.demo")}
          />
        </div>

        <div className="relative px-5 pt-6 pb-[18px] text-center">
          <div className="inline-block">
            <Wordmark color="var(--color-gold)" size={56} />
          </div>
          <div className="mt-3 font-condensed text-[10px] font-bold uppercase tracking-[0.32em] text-cream opacity-75">
            {t("tagline")}
          </div>
        </div>

        <div className="h-px bg-gold/50" />

        <div className="relative flex-1 overflow-auto">
          <PlayerRoster players={players} onName={setPlayerName} onEra={setPlayerEra} hostLockedAt={hostLockedAt} />
        </div>

        <div className="flex h-7">
          <div className="flex-1 bg-klassika-primary" />
          <div className="flex-1 bg-kasseta-primary" />
          <div className="flex-1 bg-tsifra-primary" />
        </div>
        <div className="border-t border-gold bg-ink p-[14px]">
          <YButton disabled={!canStart} onClick={onBegin}>
            {buttonLabel}
          </YButton>
        </div>

        <BottomNav />
      </div>
    </PhoneFrame>
  );
}
