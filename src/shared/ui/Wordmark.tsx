import { StyleSheet, Text, View } from "react-native";
import { fonts, fontSizes, tracking } from "@theme/tokens";

type WordmarkProps = {
  color?: string;
  size?: number;
  showRule?: boolean;
};

export function Wordmark({ color = "#D4A847", size = 56, showRule = true }: WordmarkProps) {
  const ruleH = size * 0.22;
  return (
    <View style={styles.wrap}>
      <Text style={[styles.text, { color, fontSize: size, letterSpacing: tracking(0.04, size) }]}>
        YILLAR
      </Text>
      {showRule && (
        <View style={[styles.rule, { height: ruleH, marginTop: 2 }]}>
          <View style={[styles.ruleHline, { backgroundColor: color }]} />
          <View style={[styles.ruleVline, { backgroundColor: color, left: "44%" }]} />
          <View style={[styles.ruleVline, { backgroundColor: color, left: "55%" }]} />
          <View style={[styles.ruleShort, { backgroundColor: color, left: "8%" }]} />
          <View style={[styles.ruleShort, { backgroundColor: color, left: "22%" }]} />
          <View style={[styles.ruleShort, { backgroundColor: color, left: "78%" }]} />
          <View style={[styles.ruleShort, { backgroundColor: color, left: "92%" }]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "center",
  },
  text: {
    fontFamily: fonts.display,
    lineHeight: undefined,
    includeFontPadding: false,
  },
  rule: {
    position: "relative",
  },
  ruleHline: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  ruleVline: {
    position: "absolute",
    top: 0,
    width: 1,
    bottom: 0,
  },
  ruleShort: {
    position: "absolute",
    top: 0,
    width: 1,
    height: "40%",
  },
});
