import { View, type StyleProp, type ViewStyle } from "react-native";
import { useTheme } from "@theme";

type GoldRuleProps = { style?: StyleProp<ViewStyle> };

export function GoldRule({ style }: GoldRuleProps) {
  const { colors } = useTheme();
  return <View style={[{ height: 1, backgroundColor: colors.gold, width: "100%" }, style]} />;
}
