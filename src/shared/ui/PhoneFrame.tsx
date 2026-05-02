import type { ReactNode } from "react";

type PhoneFrameProps = { children: ReactNode };

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-ink">
      {children}
    </div>
  );
}
