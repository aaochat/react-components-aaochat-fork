import React from "react";
import { useRoomInfo } from "./useRoomInfo";
import { useRoomContext } from "../context";

export function useWhiteboard() {
    const { metadata } = useRoomInfo();
    const room = useRoomContext();

    const [isWhiteboardShared, setIsWhiteboardShared] = React.useState(false);
    const [isWhiteboardHost, setIsWhiteboardHost] = React.useState(true);
    const [url, setUrl] = React.useState<string | null>(null);
    
    React.useEffect(() => {
        let meta = JSON.parse(metadata || '{}');

        if (meta) {
            if (meta?.whiteboard_domain) {
                let url = `${meta?.whiteboard_domain}?whiteboardid=${room.name}`;
                if (room.localParticipant.name) {
                    url += `&username=${room.localParticipant.name}`;
                }

                setUrl(url);
            } else {
                setUrl('/');
            }

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

    return { isWhiteboardShared, isWhiteboardHost, url };
}