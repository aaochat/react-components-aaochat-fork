import { roomInfoObserver } from '@livekit/components-core';
import type { Participant, Room } from 'livekit-client';
import * as React from 'react';

import { useEnsureParticipant, useEnsureRoom } from '../context';
import { useObservableState } from '../hooks/internal/useObservableState';
import { UseRoomInfoOptions } from './RoomName';

/** @public */
export function useRoomInfo(options: UseRoomInfoOptions = {}) {
  const room = useEnsureRoom(options.room);
  const infoObserver = React.useMemo(() => roomInfoObserver(room), [room]);
  const { name } = useObservableState(infoObserver, {
    name: room.name,
    metadata: room.metadata,
  });

  return { name };
}

/**
 * The RoomName component renders the name of the connected LiveKit room inside a span tag.
 *
 * @example
 * ```tsx
 * <LiveKitRoom>
 *   <RoomName />
 * </LiveKitRoom>
 * ```
 * @public
 */
export const WhiteBoard = (participant: Participant) => {
  const { name } = useRoomInfo();
  const p = useEnsureParticipant(participant);

  return (
    <iframe 
        src={`http://localhost:8080/?whiteboardid=${name}&username=${p.name}`} 
        width={100} 
        height={100} 
    />
  );
};

