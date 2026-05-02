import { useCallback, useEffect, useRef, useState } from "react";
import { formatTimeRange } from "./formatTime";

type PlayerInstance = {
  cueVideoById: (id: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  destroy: () => void;
};

type ReadyEvent = { target: PlayerInstance };
type StateChangeEvent = { target: PlayerInstance; data: number };

type PlayerCtor = new (
  host: HTMLElement,
  opts: {
    width: string | number;
    height: string | number;
    videoId?: string;
    host?: string;
    playerVars?: Record<string, unknown>;
    events?: {
      onReady?: (e: ReadyEvent) => void;
      onStateChange?: (e: StateChangeEvent) => void;
    };
  },
) => PlayerInstance;

type YTApi = { Player: PlayerCtor };

declare global {
  interface Window {
    YT?: YTApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const POLL_INTERVAL_MS = 250;
const API_SRC = "https://www.youtube.com/iframe_api";

const HOST_STYLE: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  left: -9999,
  top: -9999,
  opacity: 0,
  pointerEvents: "none",
  overflow: "hidden",
};

let apiPromise: Promise<YTApi> | null = null;

function loadYouTubeApi(): Promise<YTApi> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      if (window.YT) resolve(window.YT);
    };
    if (!document.querySelector(`script[src="${API_SRC}"]`)) {
      const tag = document.createElement("script");
      tag.src = API_SRC;
      tag.async = true;
      document.head.appendChild(tag);
    }
  });
  return apiPromise;
}

export type YouTubeAudioApi = {
  isReady: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number;
  timeLabel: string;
  toggle: () => void;
  play: () => void;
  pause: () => void;
  seek: (seconds: number) => void;
  PlayerHost: () => JSX.Element;
};

export function useYouTubeAudio(videoId: string | undefined): YouTubeAudioApi {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<PlayerInstance | null>(null);
  const videoIdRef = useRef<string | undefined>(videoId);
  const [isReady, setReady] = useState(false);
  const [isPlaying, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  videoIdRef.current = videoId;

  useEffect(() => {
    let mounted = true;
    let player: PlayerInstance | null = null;

    loadYouTubeApi().then((YTApi) => {
      if (!mounted || !hostRef.current) return;
      player = new YTApi.Player(hostRef.current, {
        width: "1",
        height: "1",
        videoId: videoIdRef.current,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (e) => {
            if (!mounted) return;
            playerRef.current = e.target;
            setReady(true);
            try {
              const d = e.target.getDuration();
              if (typeof d === "number") setDuration(d);
            } catch {
              /* not loaded yet */
            }
          },
          onStateChange: (e) => {
            if (!mounted) return;
            if (e.data === 1) {
              setPlaying(true);
            } else if (e.data === 0 || e.data === 2) {
              setPlaying(false);
            }
            if (e.data === 1 || e.data === 5) {
              try {
                const d = e.target.getDuration();
                if (typeof d === "number" && d > 0) setDuration(d);
              } catch {
                /* ignore */
              }
            }
          },
        },
      });
    });

    return () => {
      mounted = false;
      try {
        player?.destroy();
      } catch {
        /* SDK throws on unmount race; safe to ignore */
      }
      playerRef.current = null;
      setReady(false);
      setPlaying(false);
    };
  }, []);

  useEffect(() => {
    const player = playerRef.current;
    if (!isReady || !player || !videoId) return;
    setCurrentTime(0);
    setPlaying(false);
    setDuration(0);
    try {
      player.cueVideoById(videoId);
    } catch (err) {
      console.warn("[YILLAR] cueVideoById failed:", err);
    }
  }, [videoId, isReady]);

  useEffect(() => {
    if (!isPlaying) return;
    const id = window.setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      try {
        const t = p.getCurrentTime();
        if (typeof t === "number") setCurrentTime(t);
      } catch {
        /* ignore */
      }
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [isPlaying]);

  useEffect(() => {
    if (!isReady || duration > 0) return;
    const id = window.setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      try {
        const d = p.getDuration();
        if (typeof d === "number" && d > 0) {
          setDuration(d);
          window.clearInterval(id);
        }
      } catch {
        /* ignore */
      }
    }, 300);
    return () => window.clearInterval(id);
  }, [isReady, duration, videoId]);

  const play = useCallback(() => {
    try {
      playerRef.current?.playVideo();
    } catch {
      /* ignore */
    }
  }, []);

  const pause = useCallback(() => {
    try {
      playerRef.current?.pauseVideo();
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, pause, play]);

  const seek = useCallback((seconds: number) => {
    try {
      playerRef.current?.seekTo(seconds, true);
    } catch {
      /* ignore */
    }
  }, []);

  const PlayerHost = useCallback(
    () => <div ref={hostRef} aria-hidden style={HOST_STYLE} />,
    [],
  );

  return {
    isReady,
    isPlaying,
    currentTime,
    duration,
    progress: duration > 0 ? Math.min(1, currentTime / duration) : 0,
    timeLabel: formatTimeRange(currentTime, duration),
    toggle,
    play,
    pause,
    seek,
    PlayerHost,
  };
}
