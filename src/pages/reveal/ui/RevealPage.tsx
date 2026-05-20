import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneFrame } from "@shared/ui";
import { useGameStore, useActivePlayers, useCurrentPlayer, useLastPlacement } from "@entities/game";
import { RevealStandard } from "./RevealStandard";
import { RevealPerfect } from "./RevealPerfect";
import { RevealRejected } from "./RevealRejected";

export function RevealPage() {
  const navigate = useNavigate();
  const status = useGameStore((s) => s.status);
  const advanceTurn = useGameStore((s) => s.advanceTurn);
  const activePlayers = useActivePlayers();
  const player = useCurrentPlayer();
  const last = useLastPlacement();

  useEffect(() => {
    if (status === "lobby") navigate("/", { replace: true });
    else if (status === "ended") navigate("/end", { replace: true });
  }, [status, navigate]);

  if (!last || !player) return null;

  const activeIdx = activePlayers.findIndex((p) => p.id === player.id);
  const nextPlayer = activePlayers[(activeIdx + 1) % activePlayers.length];

  const onNext = () => {
    advanceTurn();
    const nextStatus = useGameStore.getState().status;
    navigate(nextStatus === "ended" ? "/end" : "/game");
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
