import * as React from 'react';
import { Track } from 'livekit-client';
import type { Participant, TrackPublication } from 'livekit-client';
import type { ParticipantClickEvent } from '@livekit/components-core';
import { ConnectionQualityIndicator } from './ConnectionQualityIndicator';
import { ParticipantName } from './ParticipantName';
// import { TrackMutedIndicator } from './TrackMutedIndicator';
import { useEnsureParticipant } from '../../context';
import { useParticipantTile, ParticipantContextIfNeeded } from './ParticipantTile';

/** @public */
export type ParticipantListProps = React.HTMLAttributes<HTMLDivElement> & {
  disableSpeakingIndicator?: boolean;
  participant?: Participant;
  audit_source?: Track.Source.Microphone;
  video_source?: Track.Source.Camera;
  publication?: TrackPublication;
  onParticipantClick?: (event: ParticipantClickEvent) => void;
};

/**
 * The ParticipantList component is the base utility wrapper for displaying a visual representation of a participant.
 * This component can be used as a child of the `TileLoop` or independently if a participant is passed as a property.
 *
 * @example
 * ```tsx
 * <ParticipantList />
 * ```
 * @see `ParticipantList` component
 * @public
 */
export const ParticipantList = ({
  participant,
  children,
  publication,
  disableSpeakingIndicator,
  onParticipantClick,
  ...htmlProps
}: ParticipantListProps) => {
  const p = useEnsureParticipant(participant);
  const { elementProps } = useParticipantTile({
    participant: p,
    htmlProps,
    disableSpeakingIndicator,
    source: Track.Source.Microphone,
    publication,
    onParticipantClick,
  });

  return (
    <div style={{ position: 'relative' }} {...elementProps}>
      <ParticipantContextIfNeeded participant={p}>
        {children ?? (
          <>
            <div className="lk-participant-metadata">
              <div className="lk-participant-metadata-item">
                {/* <TrackMutedIndicator source={Track.Source.Camera}></TrackMutedIndicator>
                <TrackMutedIndicator source={Track.Source.Microphone}></TrackMutedIndicator> */}
                <ParticipantName />
              </div>
              <ConnectionQualityIndicator className="lk-participant-metadata-item" />
            </div>
          </>
        )}
      </ParticipantContextIfNeeded>
    </div>
  );
};
