import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type JSX,
} from "react";
import { View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import { formatTimeRange } from "./formatTime";

// Custom YouTube iframe host implemented directly on top of react-native-webview.
// We previously used react-native-youtube-iframe but on Android the library's
// postMessage-based playVideo() command never reached the iframe player — the
// player initialised (onReady fired) but play() was a no-op.
// This implementation injects `player.playVideo()` directly via
// WebView.injectJavaScript which works reliably on Android.

type InternalApi = {
  setPlaying: (v: boolean) => void;
  setVideoId: (id: string | undefined) => void;
  seekTo: (seconds: number) => void;
  getCurrentTime: () => Promise<number | undefined>;
  getDuration: () => Promise<number | undefined>;
};

type InnerProps = {
  onStateChange: (state: string) => void;
  onReady: () => void;
  onError: (err: string) => void;
};

// HTML scaffold loaded once. The video is set/changed via injectJavaScript.
const PLAYER_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <style>
    html, body { margin: 0; padding: 0; background: #000; overflow: hidden; }
    #player { width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <div id="player"></div>
  <script>
    var player = null;
    var pending = null;
    var post = function(type, data) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, data: data }));
      }
    };

    // Translate YouTube state ints into strings we expect.
    var STATE = {
      "-1": "unstarted",
      0: "ended",
      1: "playing",
      2: "paused",
      3: "buffering",
      5: "cued"
    };

    // Load YouTube IFrame API.
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);

    window.onYouTubeIframeAPIReady = function() {
      player = new YT.Player('player', {
        width: '100%',
        height: '100%',
        playerVars: {
          playsinline: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          autoplay: 0
        },
        events: {
          onReady: function() {
            post('ready', null);
            if (pending) {
              player.cueVideoById(pending);
              pending = null;
            }
          },
          onStateChange: function(e) {
            post('state', STATE[e.data] || String(e.data));
          },
          onError: function(e) {
            post('error', String(e.data));
          }
        }
      });
    };

    // Public commands invoked via injectJavaScript from RN.
    window.YT_setVideoId = function(id) {
      if (!player) { pending = id; return; }
      if (id) { player.cueVideoById(id); }
      else { player.stopVideo(); }
    };
    window.YT_play = function() { if (player && player.playVideo) player.playVideo(); };
    window.YT_pause = function() { if (player && player.pauseVideo) player.pauseVideo(); };
    window.YT_seek = function(s) { if (player && player.seekTo) player.seekTo(s, true); };
    window.YT_currentTime = function(token) {
      var t = player && player.getCurrentTime ? player.getCurrentTime() : 0;
      post('currentTime', { token: token, value: t });
    };
    window.YT_duration = function(token) {
      var d = player && player.getDuration ? player.getDuration() : 0;
      post('duration', { token: token, value: d });
    };
    true;
  </script>
</body>
</html>
`.trim();

const InnerPlayer = forwardRef<InternalApi, InnerProps>(
  ({ onStateChange, onReady, onError }, ref) => {
    const webRef = useRef<WebView>(null);
    const tokenRef = useRef(0);
    const pendingTimes = useRef(new Map<number, (v: number) => void>());
    const pendingDurations = useRef(new Map<number, (v: number) => void>());

    const inject = useCallback((js: string) => {
      webRef.current?.injectJavaScript(js + " true;");
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        setPlaying: (v) => {
          inject(v ? "window.YT_play();" : "window.YT_pause();");
        },
        setVideoId: (id) => {
          if (!id) inject("window.YT_setVideoId(null);");
          else inject(`window.YT_setVideoId(${JSON.stringify(id)});`);
        },
        seekTo: (s) => inject(`window.YT_seek(${s});`),
        getCurrentTime: () =>
          new Promise<number | undefined>((resolve) => {
            const token = ++tokenRef.current;
            pendingTimes.current.set(token, resolve);
            inject(`window.YT_currentTime(${token});`);
            // Safety: clear pending after 2s to avoid leak.
            setTimeout(() => {
              if (pendingTimes.current.delete(token)) resolve(undefined);
            }, 2000);
          }),
        getDuration: () =>
          new Promise<number | undefined>((resolve) => {
            const token = ++tokenRef.current;
            pendingDurations.current.set(token, resolve);
            inject(`window.YT_duration(${token});`);
            setTimeout(() => {
              if (pendingDurations.current.delete(token)) resolve(undefined);
            }, 2000);
          }),
      }),
      [inject],
    );

    const onMessage = useCallback(
      (event: WebViewMessageEvent) => {
        let msg: { type: string; data: unknown };
        try {
          msg = JSON.parse(event.nativeEvent.data) as { type: string; data: unknown };
        } catch {
          return;
        }
        if (msg.type === "ready") onReady();
        else if (msg.type === "state") onStateChange(String(msg.data));
        else if (msg.type === "error") onError(String(msg.data));
        else if (msg.type === "currentTime") {
          const { token, value } = msg.data as { token: number; value: number };
          const resolve = pendingTimes.current.get(token);
          if (resolve) {
            pendingTimes.current.delete(token);
            resolve(value);
          }
        } else if (msg.type === "duration") {
          const { token, value } = msg.data as { token: number; value: number };
          const resolve = pendingDurations.current.get(token);
          if (resolve) {
            pendingDurations.current.delete(token);
            resolve(value);
          }
        }
      },
      [onReady, onStateChange, onError],
    );

    // baseUrl MUST NOT be youtube.com — YouTube refuses to embed videos when
    // the embedder origin is youtube.com itself (error 152 "embed not
    // allowed"). Using a non-youtube https origin works (same as how
    // react-native-youtube-iframe uses github.io as its host page).
    const source = useMemo(() => ({ html: PLAYER_HTML, baseUrl: "https://yillar.app" }), []);

    return (
      <WebView
        ref={webRef}
        source={source}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        onMessage={onMessage}
        style={{ flex: 1, backgroundColor: "transparent" }}
      />
    );
  },
);
InnerPlayer.displayName = "YTInnerPlayer";

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

const POLL_INTERVAL_MS = 250;

export function useYouTubeAudio(videoId: string | undefined): YouTubeAudioApi {
  const innerRef = useRef<InternalApi>(null);
  const [isReady, setReady] = useState(false);
  const [isPlaying, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const isPlayingRef = useRef(isPlaying);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Push new videoId into the inner player.
  const lastVideoIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (lastVideoIdRef.current === videoId) return;
    lastVideoIdRef.current = videoId;
    innerRef.current?.setVideoId(videoId);
    setCurrentTime(0);
    setDuration(0);
    setPlaying(false);
  }, [videoId]);

  // Poll currentTime while playing.
  useEffect(() => {
    if (!isPlaying || !isReady) return;
    const id = setInterval(async () => {
      const t = await innerRef.current?.getCurrentTime();
      if (typeof t === "number") setCurrentTime(t);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isPlaying, isReady]);

  // Poll duration after ready until we have it.
  useEffect(() => {
    if (!isReady || duration > 0) return;
    const id = setInterval(async () => {
      const d = await innerRef.current?.getDuration();
      if (typeof d === "number" && d > 0) {
        setDuration(d);
        clearInterval(id);
      }
    }, 400);
    return () => clearInterval(id);
  }, [isReady, duration]);

  const onStateChange = useCallback((state: string) => {
    if (state === "playing") setPlaying(true);
    else if (state === "paused" || state === "ended") setPlaying(false);
  }, []);

  const onReady = useCallback(() => {
    setReady(true);
  }, []);

  const onError = useCallback((err: string) => {
    console.warn("[YT] error", err);
  }, []);

  const play = useCallback(() => {
    setPlaying(true);
    innerRef.current?.setPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setPlaying(false);
    innerRef.current?.setPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    const next = !isPlayingRef.current;
    setPlaying(next);
    innerRef.current?.setPlaying(next);
  }, []);

  const seek = useCallback((seconds: number) => {
    innerRef.current?.seekTo(seconds);
  }, []);

  // PlayerHost is mounted once. WebView never unmounts during gameplay.
  // It must occupy real layout dimensions (not 1×1) so YouTube doesn't treat
  // it as a bot. We hide it visually via translate + opacity.
  const PlayerHost = useCallback(
    (): JSX.Element => (
      <View
        style={{
          position: "absolute",
          width: 280,
          height: 160,
          left: 0,
          top: 0,
          opacity: 0,
          transform: [{ translateX: -9999 }],
        }}
        pointerEvents="none"
      >
        <InnerPlayer
          ref={innerRef}
          onStateChange={onStateChange}
          onReady={onReady}
          onError={onError}
        />
      </View>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
