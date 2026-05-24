import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { GirihOverlay, PhoneFrame, Wordmark, YButton } from "@shared/ui";
import { useT, haptic } from "@shared/lib";
import { useGameStore } from "@entities/game";
import { useSessionStore } from "@entities/session";
import { useTracks } from "@entities/track";
import { PlayerRoster } from "@features/lobby/PlayerRoster";
import { BottomNav } from "@features/navigation/BottomNav";
import { useTheme } from "@theme";
import { fonts } from "@theme/tokens";

export default function LobbyPage() {
  const router = useRouter();
  const t = useT();
  const { colors } = useTheme();

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
      router.replace("/game");
      return;
    }
    const id = setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown, router]);

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
      <View style={[styles.container, { backgroundColor: colors.ink }]}>
        {countdown !== null && countdown > 0 && (
          <View style={[styles.countOverlay, { backgroundColor: colors.ink }]}>
            <Text style={[styles.countNum, { color: colors.gold }]}>{countdown}</Text>
          </View>
        )}
        <GirihOverlay size={200} opacity={0.05} />

        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={[styles.backText, { color: colors.cream3 }]}>{t("online.waitBack")}</Text>
          </Pressable>
          <Wordmark color={colors.gold} size={48} />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.gold, opacity: 0.5 }]} />

        <PlayerRoster
          players={players}
          onName={setPlayerName}
          onEra={setPlayerEra}
          hostLockedAt={hostLockedAt}
        />

        <View style={[styles.footer, { borderTopColor: colors.ink3 }]}>
          <YButton disabled={!canStart} onPress={onBegin}>
            {buttonLabel}
          </YButton>
        </View>

        <BottomNav />
      </View>
    </PhoneFrame>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    alignItems: "center",
    gap: 8,
  },
  backBtn: {
    alignSelf: "flex-start",
  },
  backText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 10 * 0.15,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  divider: {
    height: 1,
  },
  footer: {
    padding: 14,
    borderTopWidth: 1,
  },
  countOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  countNum: {
    fontFamily: fonts.display,
    fontSize: 120,
    fontWeight: "900",
    includeFontPadding: false,
  },
});
