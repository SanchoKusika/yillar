import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { HomePage } from "@pages/home";
import { LobbyPage } from "@pages/lobby";
import { OnlinePage, WaitingRoomPage, OnlineGamePage, OnlineRevealPage, OnlineEndPage } from "@pages/online";
import { GamePage } from "@pages/game";
import { RevealPage } from "@pages/reveal";
import { EndPage } from "@pages/end";
import { AuthPage } from "@pages/auth";
import { ProfilePage } from "@pages/profile";
import { ResetPasswordPage } from "@pages/reset-password";
import { PWAPrompt } from "@widgets/pwa-prompt";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <div key={location.key} className="page-enter">
      <Routes location={location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/online" element={<OnlinePage />} />
        <Route path="/online/room/:code" element={<WaitingRoomPage />} />
        <Route path="/online/game/:code" element={<OnlineGamePage />} />
        <Route path="/online/reveal/:code/:trackIdx" element={<OnlineRevealPage />} />
        <Route path="/online/end/:code" element={<OnlineEndPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/reveal" element={<RevealPage />} />
        <Route path="/end" element={<EndPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export function App() {
  return (
    <div className="min-h-dvh bg-ink text-cream font-body">
      <AnimatedRoutes />
      <PWAPrompt />
    </div>
  );
}
