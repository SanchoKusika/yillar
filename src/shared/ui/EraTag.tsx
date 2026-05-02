import type { Era } from "@shared/lib";
import { eraVar, useT } from "@shared/lib";

type EraTagProps = {
  era?: Era;
  boxed?: boolean;
  size?: "sm" | "lg";
  onDark?: boolean;
};

export function EraTag({ era = "klassika", boxed = false, size = "sm", onDark: _onDark = false }: EraTagProps) {
  const t = useT();
  const fg = eraVar(era, "primary");
  return (
    <span
      className="inline-block font-condensed font-bold uppercase"
      style={{
        color: fg,
        fontSize: size === "lg" ? 14 : 11,
        letterSpacing: "0.22em",
        padding: boxed ? "5px 9px 4px" : 0,
        border: boxed ? `1px solid ${fg}` : 0,
      }}
    >
      {t(`era.${era}` as const)}
    </span>
  );
}
