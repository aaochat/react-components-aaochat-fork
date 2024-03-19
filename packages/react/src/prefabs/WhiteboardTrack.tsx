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
    const room = useRoomContext();
    const url = `https://cloud13.de/testwhiteboard/?whiteboardid=${room.name}`;

    return <iframe src={url} width={"100%"} height={'100%'}></iframe>;
}
