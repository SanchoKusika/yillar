export function haptic(type: "light" | "medium" | "heavy" = "medium") {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  const ms = type === "light" ? 18 : type === "medium" ? 45 : 90;
  navigator.vibrate(ms);
}
