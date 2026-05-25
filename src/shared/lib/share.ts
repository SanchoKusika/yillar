import { Share } from "react-native";
import * as Clipboard from "expo-clipboard";

export type ShareOutcome = "shared" | "copied" | "cancelled";

export async function shareResult(text: string): Promise<ShareOutcome> {
  try {
    const result = await Share.share({ title: "YILLAR", message: text });
    if (result.action === Share.dismissedAction) return "cancelled";
    return "shared";
  } catch {
    // Share dialog failed (no provider, etc.) — fall back to clipboard.
    await Clipboard.setStringAsync(text);
    return "copied";
  }
}

export async function copyToClipboard(text: string): Promise<void> {
  await Clipboard.setStringAsync(text);
}
