import { useEffect, useRef, useState } from "react";
import DailyIframe, { type DailyCall, type DailyParticipant } from "@daily-co/daily-js";
import { fetchVideoToken } from "../lib/api.js";

export type DailyVideoParticipant = {
  id: string;
  name: string;
  isLocal: boolean;
  videoTrack: MediaStreamTrack | null;
  cameraOff: boolean;
};

function mapParticipants(
  raw: Record<string, DailyParticipant>
): DailyVideoParticipant[] {
  return Object.values(raw).map((p) => ({
    id: p.session_id,
    name: p.local ? "You" : p.user_name || "Student",
    isLocal: Boolean(p.local),
    videoTrack: p.tracks?.video?.persistentTrack ?? null,
    cameraOff: p.tracks?.video?.state !== "playable",
  }));
}

export function useDailyCall(roomId: string, enabled: boolean) {
  const callRef = useRef<DailyCall | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [participants, setParticipants] = useState<DailyVideoParticipant[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let callObject: DailyCall | null = null;

    async function connect() {
      try {
        const { token, roomUrl } = await fetchVideoToken(roomId);
        if (cancelled || !roomUrl || !token) return;

        callObject = DailyIframe.createCallObject({
          audioSource: false,
          videoSource: true,
        });
        callRef.current = callObject;

        const sync = () => {
          if (!callObject || cancelled) return;
          setParticipants(mapParticipants(callObject.participants()));
        };

        callObject.on("joined-meeting", () => {
          if (cancelled) return;
          setIsConnected(true);
          sync();
        });
        callObject.on("participant-joined", sync);
        callObject.on("participant-updated", sync);
        callObject.on("participant-left", sync);
        callObject.on("track-started", sync);
        callObject.on("track-stopped", sync);

        await callObject.join({
          url: roomUrl,
          token,
          startAudioOff: true,
          startVideoOff: false,
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Video unavailable");
          setIsConnected(false);
        }
      }
    }

    connect();

    return () => {
      cancelled = true;
      setIsConnected(false);
      setParticipants([]);
      if (callObject) {
        callObject.leave().catch(() => {});
        callObject.destroy().catch(() => {});
      }
      callRef.current = null;
    };
  }, [roomId, enabled]);

  function toggleCamera() {
    const call = callRef.current;
    if (!call) return;
    const next = !isCameraOn;
    call.setLocalVideo(next);
    setIsCameraOn(next);
  }

  return { isConnected, isCameraOn, toggleCamera, participants, error };
}
