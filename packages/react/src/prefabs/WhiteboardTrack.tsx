import * as React from 'react';
import { useWhiteboard } from '../hooks/useWhiteboard';

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
    const { url } = useWhiteboard();

    return <iframe src={url} width={"100%"} height={'100%'}></iframe>;
}
