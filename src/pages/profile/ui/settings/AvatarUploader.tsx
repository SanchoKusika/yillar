import { useRef, useState, type ChangeEvent } from "react";
import { YButton, Banner } from "@shared/ui";
import { useT } from "@shared/lib";
import styles from "../ProfilePage.module.css";

type AvatarUploaderProps = {
  avatarUrl: string | null;
  initial: string;
  onUpload: (file: File) => Promise<void>;
};

export function AvatarUploader({ avatarUrl, initial, onUpload }: AvatarUploaderProps) {
  const t = useT();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPick = () => fileRef.current?.click();

  const onChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      await onUpload(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("profile.uploadFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onChange} />
      <div className="flex items-stretch gap-3">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className={styles.avatarSquare} onClick={onPick} />
        ) : (
          <div className={styles.avatarSquareLetter} onClick={onPick}>{initial}</div>
        )}
        <YButton variant="ghost" className="flex-1" onClick={onPick} disabled={busy}>
          {busy
            ? t("profile.settings.uploading")
            : avatarUrl
              ? t("profile.settings.replace")
              : t("profile.settings.upload")}
        </YButton>
      </div>
      {error && <Banner variant="error">{error}</Banner>}
    </>
  );
}
