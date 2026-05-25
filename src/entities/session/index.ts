export type { Profile, AuthUserSummary } from "./model/types";
export { useSessionStore } from "./model/store";
export {
  fetchProfile,
  ensureProfile,
  updateProfile,
  uploadAvatar,
  signInAnonymously,
  signInWithEmail,
  signUpWithEmail,
  signOut,
  resetPasswordForEmail,
  updatePassword,
} from "./api/sessionApi";
export type { AvatarFile } from "./api/sessionApi";
export { useIsAuthenticated, useIsAnonymous, useDisplayName } from "./lib/selectors";
