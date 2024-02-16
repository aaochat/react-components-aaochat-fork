import { BackgroundBlur } from "@livekit/track-processors";
import { useRoomContext } from "../context";
import { LocalVideoTrack, Track } from "livekit-client";
import React from "react";

export interface BlurIndicaterProps {
    source: Track.Source.Camera;
    ref: any;
}

export function BlurIndicater({ source, ref }: BlurIndicaterProps) {
    const state = {
        defaultDevices: new Map<MediaDeviceKind, string>(),
        bitrateInterval: undefined as any,
        blur: BackgroundBlur(10, { delegate: 'GPU' }),
        // virtualBackground: VirtualBackground('/samantha-gades-BlIhVfXbi9s-unsplash.jpg'),
    };

    const room = useRoomContext();
    const [isBlur, setIsBlur] = React.useState(false);
    const toggleBlur = async () => {
        if (!room) return;

        try {
            const camTrack = room.localParticipant.getTrack(source)!
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
            // renderParticipant(currentRoom.localParticipant);
            // updateButtonsForPublishState();
        }
    }

    return (
        <button ref={ref} className="tl-blur lk-button" onClick={toggleBlur}>
            {isBlur ? 'Remove Blur' : 'Blur Background'}
        </button>
    )
}