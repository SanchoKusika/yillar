import { Pressable, StyleSheet, View } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSessionStore } from "@entities/session";
import { IconHome, IconProfile, IconAuth } from "@shared/ui";
import { useTheme } from "@theme";

type Tab = { path: string; key: string; icon: (props: { size: number; color: string }) => React.JSX.Element };

export function BottomNav() {
  const { colors } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const isRegistered = useSessionStore((s) => s.user !== null && !s.user?.isAnonymous);

  const tabs: Tab[] = [
    { path: "/", key: "home", icon: ({ size, color }) => <IconHome size={size} color={color} /> },
    { path: "/profile", key: "profile", icon: ({ size, color }) => <IconProfile size={size} color={color} /> },
    ...(isRegistered
      ? []
      : [{ path: "/auth", key: "auth", icon: ({ size, color }: { size: number; color: string }) => <IconAuth size={size} color={color} /> }]),
  ];

  return (
    <View
      style={[
        styles.nav,
        {
          backgroundColor: colors.ink,
          borderTopColor: colors.gold,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {tabs.map(({ path, key, icon: Icon }, i) => {
        const active = pathname === path;
        const color = active ? colors.gold : colors.cream;
        const borderRight =
          i < tabs.length - 1 ? { borderRightWidth: 1, borderRightColor: colors.ink3 } : {};
        return (
          <Pressable
            key={key}
            onPress={() => router.push(path as `/${string}`)}
            style={[
              styles.tab,
              borderRight,
              { opacity: active ? 1 : 0.55 },
              active && { backgroundColor: colors.ink2 },
            ]}
          >
            <Icon size={22} color={color} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: "row",
    borderTopWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
    paddingBottom: 14,
    paddingHorizontal: 4,
  },
});
