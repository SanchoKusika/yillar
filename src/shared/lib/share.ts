export type ShareOutcome = "shared" | "copied" | "cancelled";

export async function shareResult(text: string): Promise<ShareOutcome> {
  if (navigator.share) {
    try {
      await navigator.share({ title: "YILLAR", text });
      return "shared";
    } catch (e) {
      if ((e as DOMException).name === "AbortError") return "cancelled";
    }
  }
  await navigator.clipboard.writeText(text);
  return "copied";
}
