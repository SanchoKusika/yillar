import { StyleSheet, View } from "react-native";
import type { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@theme";
import { layout } from "@theme/tokens";

type PhoneFrameProps = { children: ReactNode };

export function PhoneFrame({ children }: PhoneFrameProps) {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.ink }]}>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignSelf: "center",
    width: "100%",
    maxWidth: layout.maxContentWidth,
  },
});
