import { useEffect } from "react";
import { useRouter } from "expo-router";
import { PhoneFrame } from "@shared/ui";
import { useGameStore, useActivePlayers, useCurrentPlayer, useLastPlacement } from "@entities/game";
import { RevealStandard } from "@features/reveal/RevealStandard";
import { RevealPerfect } from "@features/reveal/RevealPerfect";
import { RevealRejected } from "@features/reveal/RevealRejected";

export default function RevealPage() {
  const router = useRouter();
  const status = useGameStore((s) => s.status);
  const advanceTurn = useGameStore((s) => s.advanceTurn);
  const activePlayers = useActivePlayers();
  const player = useCurrentPlayer();
  const last = useLastPlacement();

  useEffect(() => {
    if (status === "lobby") router.replace("/");
    else if (status === "ended") router.replace("/end");
  }, [status, router]);

  if (!last || !player) return null;

  const activeIdx = activePlayers.findIndex((p) => p.id === player.id);
  const nextPlayer = activePlayers[(activeIdx + 1) % activePlayers.length];

  const onNext = () => {
    advanceTurn();
    const nextStatus = useGameStore.getState().status;
    router.replace(nextStatus === "ended" ? "/end" : "/game");
  };

  const variant = last.skipped ? "rejected" : last.delta === 0 ? "perfect" : "standard";

  return (
    <PhoneFrame>
      {variant === "rejected" && (
        <RevealRejected last={last} nextPlayer={nextPlayer} onNext={onNext} />
      )}
      {variant === "perfect" && (
        <RevealPerfect last={last} nextPlayer={nextPlayer} onNext={onNext} />
      )}
      {variant === "standard" && (
        <RevealStandard last={last} nextPlayer={nextPlayer} onNext={onNext} />
      )}
    </PhoneFrame>
  );
}
