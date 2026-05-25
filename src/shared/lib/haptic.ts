import * as Haptics from "expo-haptics";

export function haptic(type: "light" | "medium" | "heavy" = "medium") {
  const style =
    type === "light"
      ? Haptics.ImpactFeedbackStyle.Light
      : type === "heavy"
        ? Haptics.ImpactFeedbackStyle.Heavy
        : Haptics.ImpactFeedbackStyle.Medium;
  void Haptics.impactAsync(style).catch(() => {
    // Silently ignore on devices without haptic engines.
  });
}
