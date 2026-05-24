import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CatalogLine, EraSelect, GirihOverlay, PhoneFrame, Wordmark, YButton } from "@shared/ui";
import { TextInput } from "@shared/ui";
import { useT, haptic, type Era } from "@shared/lib";
import { useSessionStore } from "@entities/session";
import { getTracks } from "@entities/track";
import {
  useRoom,
  useRoomPlayers,
  updateRoomPlayer,
  startGame,
  leaveRoom,
  deleteRoom,
  ensureInRoom,
} from "@entities/room";
import { BottomNav } from "@features/navigation/BottomNav";
import { useTheme } from "@theme";
import { fonts } from "@theme/tokens";
import { copyToClipboard } from "@shared/lib/share";

export default function WaitingRoomPage() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const t = useT();
  const { colors } = useTheme();
  const user = useSessionStore((s) => s.user);
  const profile = useSessionStore((s) => s.profile);

  const room = useRoom(code ?? null);
  const players = useRoomPlayers(room?.id ?? null);
  const myPlayer = players.find((p) => p.playerId === user?.id);

  const [localName, setLocalName] = useState(profile?.displayName ?? "");
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const ensuredRef = useRef(false);

  useEffect(() => {
    if (!room || !user || ensuredRef.current) return;
    if (room.status !== "waiting") return;
    ensuredRef.current = true;
    void ensureInRoom(room.id, user.id, localName || (profile?.displayName ?? ""));
  }, [room?.id, room?.status, user?.id]);

  // Countdown when game starts
  useEffect(() => {
    if (room?.status === "playing" && countdown === null) {
      setCountdown(3);
    }
  }, [room?.status, countdown]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      router.replace(`/online/game/${code}`);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, code]);

  useEffect(() => {
    if (myPlayer?.name && !localName) {
      setLocalName(myPlayer.name);
    }
  }, [myPlayer?.name]);

  const handleNameBlur = () => {
    if (!room || !user || !localName.trim()) return;
    void updateRoomPlayer(room.id, user.id, { name: localName.trim() });
  };

  const handleEra = (era: Era) => {
    if (!room || !user) return;
    haptic("light");
    void updateRoomPlayer(room.id, user.id, { era });
  };

  const handleCopy = async () => {
    await copyToClipboard(code ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = async () => {
    if (!room || !user) return;
    haptic("light");
    if (myPlayer?.isHost) {
      await deleteRoom(room.id);
    } else {
      await leaveRoom(room.id, user.id);
    }
    router.replace("/online");
  };

  const allReady = players.length >= 2 && players.every((p) => p.name && p.era);

  const handleStart = async () => {
    if (!room || !myPlayer?.isHost || !allReady || starting) return;
    setStarting(true);
    haptic("medium");
    try {
      const tracks = await getTracks(12);
      await startGame(room.id, tracks.map((tr) => tr.id));
    } catch {
      setStarting(false);
    }
  };

  if (!room) {
    return (
      <PhoneFrame>
        <View style={[styles.loadingCenter, { backgroundColor: colors.ink }]}>
          <Text style={[styles.loadingLabel, { color: colors.cream3 }]}>{t("online.waitLoading")}</Text>
        </View>
      </PhoneFrame>
    );
  }

  const startLabel = (() => {
    if (starting) return t("online.creating");
    if (players.length < 2) return t("online.waitNeedPlayers");
    if (!allReady) return t("online.waitNeedEra");
    return t("online.waitStart", { n: players.length });
  })();

  return (
    <PhoneFrame>
      <View style={[styles.container, { backgroundColor: colors.ink }]}>
        {countdown !== null && countdown > 0 && (
          <View style={styles.countOverlay}>
            <Text style={styles.countNum}>{countdown}</Text>
          </View>
        )}

        <GirihOverlay size={200} opacity={0.05} />

        <View style={[styles.pageHeader, { borderBottomColor: colors.gold }]}>
          <Pressable onPress={handleLeave} style={styles.leaveBtn}>
            <Text style={[styles.leaveBtnText, { color: colors.cream3 }]}>{t("online.waitBack")}</Text>
          </Pressable>
          <Wordmark size={44} />
        </View>

        {/* Room code banner */}
        <View style={[styles.codeBanner, { borderBottomColor: colors.ink3, backgroundColor: colors.ink2 }]}>
          <View style={styles.codeGroup}>
            <Text style={[styles.codeLabel, { color: colors.cream3 }]}>{t("online.waitCode")}</Text>
            <Text style={[styles.codeValue, { color: colors.gold }]}>{code}</Text>
          </View>
          <Pressable
            onPress={handleCopy}
            style={[styles.copyBtn, { borderColor: copied ? colors.gold : colors.ink3 }]}
          >
            <Text style={[styles.copyBtnText, { color: copied ? colors.gold : colors.cream3 }]}>
              {copied ? t("online.waitCopied") : t("online.waitCopy")}
            </Text>
          </Pressable>
        </View>

        {/* Players roster */}
        <ScrollView style={styles.rosterScroll} contentContainerStyle={styles.rosterContent}>
          <CatalogLine
            left={t("online.waitPlayers", { n: players.length })}
            right={`${players.filter((p) => p.name && p.era).length} / ${players.length}`}
            style={{ marginBottom: 10 }}
          />

          {players.map((p, idx) => {
            const isMe = p.playerId === user?.id;
            const filled = !!(p.name && p.era);

            return (
              <View
                key={p.id}
                style={[
                  styles.playerRow,
                  {
                    borderColor: colors.ink3,
                    backgroundColor: filled ? colors.ink2 : colors.ink,
                  },
                ]}
              >
                <View style={styles.playerMeta}>
                  <Text style={[styles.playerLabel, { color: colors.cream3 }]}>
                    {`${t("roster.playerPrefix")}${String(idx + 1).padStart(2, "0")}`}
                  </Text>
                  <View style={styles.badgeRow}>
                    {p.isHost && (
                      <View style={[styles.badge, { backgroundColor: colors.gold }]}>
                        <Text style={[styles.badgeText, { color: colors.ink }]}>{t("online.waitHost")}</Text>
                      </View>
                    )}
                    {isMe && !p.isHost && (
                      <View style={[styles.badge, { borderColor: colors.ink3, borderWidth: 1 }]}>
                        <Text style={[styles.badgeText, { color: colors.cream3 }]}>{t("online.waitYou")}</Text>
                      </View>
                    )}
                  </View>

                  {isMe ? (
                    <TextInput
                      value={localName}
                      onChangeText={(v) => setLocalName(v.toUpperCase().slice(0, 12))}
                      onBlur={handleNameBlur}
                      placeholder={t("online.waitNamePh")}
                      autoCapitalize="characters"
                      autoCorrect={false}
                      maxLength={12}
                    />
                  ) : (
                    <Text style={[styles.playerNameStatic, { color: colors.cream }]}>
                      {p.name || "…"}
                    </Text>
                  )}

                  <View style={[styles.readyDot, { backgroundColor: filled ? colors.gold : colors.ink3 }]} />
                </View>

                {isMe ? (
                  <EraSelect value={myPlayer?.era ?? null} onChange={handleEra} />
                ) : p.era ? (
                  <EraSelect value={p.era} onChange={() => {}} />
                ) : null}
              </View>
            );
          })}

          <Text style={[styles.hint, { color: colors.cream3 }]}>{t("roster.hint")}</Text>
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: colors.ink3 }]}>
          {myPlayer?.isHost ? (
            <YButton disabled={!allReady || starting} onPress={handleStart}>
              {startLabel}
            </YButton>
          ) : (
            <Text style={[styles.waitingText, { color: colors.cream3 }]}>{t("online.waitWaiting")}</Text>
          )}
        </View>

        <BottomNav />
      </View>
    </PhoneFrame>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingCenter: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 10 * 0.18,
    includeFontPadding: false,
  },
  countOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.8)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99,
  },
  countNum: {
    fontFamily: "PlayfairDisplay-Black",
    fontSize: 120,
    color: "#D4A847",
    includeFontPadding: false,
  },
  pageHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  leaveBtn: { alignSelf: "flex-start" },
  leaveBtnText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 10 * 0.14,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  codeBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  codeGroup: { gap: 2 },
  codeLabel: {
    fontFamily: fonts.mono,
    fontSize: 8,
    letterSpacing: 8 * 0.22,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  codeValue: {
    fontFamily: fonts.monoBold,
    fontSize: 22,
    letterSpacing: 22 * 0.2,
    includeFontPadding: false,
  },
  copyBtn: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  copyBtnText: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 9 * 0.14,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  rosterScroll: { flex: 1 },
  rosterContent: { padding: 12, paddingBottom: 8 },
  playerRow: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 8,
    gap: 8,
  },
  playerMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  playerLabel: {
    fontFamily: fonts.mono,
    fontSize: 8,
    letterSpacing: 8 * 0.18,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  badgeRow: { flexDirection: "row", gap: 4 },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: fonts.mono,
    fontSize: 8,
    letterSpacing: 8 * 0.14,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  playerNameStatic: {
    fontFamily: fonts.condensedBold,
    fontSize: 16,
    fontWeight: "700",
    textTransform: "uppercase",
    flex: 1,
    includeFontPadding: false,
  },
  readyDot: { width: 6, height: 6, borderRadius: 3, marginLeft: "auto" },
  hint: {
    fontFamily: fonts.mono,
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 9 * 0.12,
    marginTop: 8,
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
    letterSpacing: 10 * 0.18,
    textAlign: "center",
    includeFontPadding: false,
  },
});
