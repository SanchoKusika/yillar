type WordmarkProps = {
  color?: string;
  size?: number;
  showRule?: boolean;
};

export function Wordmark({ color = "var(--color-gold)", size = 64, showRule = true }: WordmarkProps) {
  const ruleH = size * 0.22;
  return (
    <div style={{ color }} className="inline-block">
      <div
        className="font-display font-black leading-none"
        style={{ fontSize: size, letterSpacing: "0.04em" }}
      >
        YILLAR
      </div>
      {showRule && (
        <div className="relative mt-[2px]" style={{ height: ruleH }}>
          <span className="absolute inset-x-0 top-0 h-px bg-current" />
          <span className="absolute top-0 h-full w-px bg-current" style={{ left: "44%" }} />
          <span className="absolute top-0 h-full w-px bg-current" style={{ left: "55%" }} />
          <span className="absolute top-0 w-px bg-current" style={{ left: "8%", height: "40%" }} />
          <span className="absolute top-0 w-px bg-current" style={{ left: "22%", height: "40%" }} />
          <span className="absolute top-0 w-px bg-current" style={{ left: "78%", height: "40%" }} />
          <span className="absolute top-0 w-px bg-current" style={{ left: "92%", height: "40%" }} />
        </div>
      )}
    </div>
  );
}
