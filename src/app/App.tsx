import { Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "@pages/home";
import { GamePage } from "@pages/game";
import { RevealPage } from "@pages/reveal";
import { EndPage } from "@pages/end";
import { AuthPage } from "@pages/auth";
import { ProfilePage } from "@pages/profile";
import { ResetPasswordPage } from "@pages/reset-password";
import { PWAPrompt } from "@widgets/pwa-prompt";

export function App() {
  return (
    <div className="min-h-dvh bg-ink text-cream font-body">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/reveal" element={<RevealPage />} />
        <Route path="/end" element={<EndPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <PWAPrompt />
    </div>
  );
}
