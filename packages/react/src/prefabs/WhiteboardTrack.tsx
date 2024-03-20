import * as React from 'react';
import { useRoomContext } from '../context';

/**
 * The WhiteboardTrack component is responsible for rendering whiteboard.
 *
 * @example
 * ```tsx
 *   <ParticipantTile>
 *     <WhiteboardTrack />
 *   </ParticipantTile>
 * ```
 *
 * @see `ParticipantTile` component
 * @public
 */
export function WhiteboardTrack() {
    return <iframe src={getURL()} width={"100%"} height={'100%'}></iframe>;
}

export function getURL() {
    const room = useRoomContext();

    let url = `https://cloud13.de/testwhiteboard/?whiteboardid=${room.name}`;

    const username = room.localParticipant.name;

    if (username) {
        url += `&username=${username}`;
    }

    return url;
}
