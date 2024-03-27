import React from "react";
import { useRoomInfo } from "./useRoomInfo";
import { useRoomContext } from "../context";

export function useWhiteboard() {
    const { metadata } = useRoomInfo();
    const room = useRoomContext();

    const [isWhiteboardShared, setIsWhiteboardShared] = React.useState(false);
    const [isWhiteboardHost, setIsWhiteboardHost] = React.useState(true);
  
    React.useEffect(() => {
        let meta = JSON.parse(metadata || '{}');

        if (meta) {
            if (meta?.whiteboard) {
            setIsWhiteboardShared(meta?.whiteboard);
        } else {
            setIsWhiteboardShared(false);
        } 

        if (meta?.whiteboard_host == room.localParticipant.identity) {
            setIsWhiteboardHost(true);
        } else {
            setIsWhiteboardHost(false);
        }
        }
        
    }, [metadata]);

    return { isWhiteboardShared, isWhiteboardHost };
}