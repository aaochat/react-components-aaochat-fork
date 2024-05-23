import { BackgroundBlur } from "@livekit/track-processors";
import { useRoomContext } from "../context";
import { LocalVideoTrack, Track } from "livekit-client";
import React from "react";

export interface BlurIndicaterProps {
    source: Track.Source.Camera;
    parentCallback: () => void;
}

export function BlurIndicater({ source, parentCallback }: BlurIndicaterProps) {
    const state = {
        defaultDevices: new Map<MediaDeviceKind, string>(),
        bitrateInterval: undefined as any,
        blur: BackgroundBlur(10, { delegate: 'GPU' }),
    };

    const room = useRoomContext();
    const [isBlur, setIsBlur] = React.useState(false);
    const [isCameraEnabled, setIsCameraEnabled] = React.useState(false);
    const track = room?.localParticipant.getTrackPublication(source);

    React.useEffect(() => {
        if (track?.isMuted) {
            setIsCameraEnabled(false);
        } else {
            setIsCameraEnabled(true);
        }
    }, [track]);

    const toggleBlur = async () => {
        if (!room) return;

        try {
            const camTrack = room.localParticipant.getTrackPublication(source)!
                .track as LocalVideoTrack;

            if (camTrack.getProcessor()?.name !== 'background-blur') {
                await camTrack.setProcessor(state.blur);
                setIsBlur(true);
            } else {
                await camTrack.stopProcessor();
                setIsBlur(false);
            }
        } catch (e: any) {
            console.log(`ERROR: ${e.message}`);
        } finally {
            parentCallback();
        }
    }

    return (
        <button className="tl-blur lk-button" onClick={toggleBlur} disabled={isCameraEnabled}>
            {isBlur ? 'Remove Blur' : 'Blur Background'}
        </button>
    )
}