import * as React from 'react';
import { Track } from 'livekit-client';
import type { Participant, TrackPublication } from 'livekit-client';
import type { ParticipantClickEvent } from '@livekit/components-core';
// import { ConnectionQualityIndicator } from './ConnectionQualityIndicator';
import { ParticipantName } from './ParticipantName';
import { useEnsureParticipant } from '../../context';
import { ParticipantContextIfNeeded } from './ParticipantTile';
import { useParticipantTile } from '../../hooks';
import { TrackMutedIndicator } from './TrackMutedIndicator';
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
  const trackReference = {
    participant: p,
    source: Track.Source.Camera,
  };

  const { elementProps } = useParticipantTile({
    htmlProps,
    disableSpeakingIndicator,
    onParticipantClick,
    trackRef: trackReference
  });

  return (
    <div style={{ position: 'relative' }} {...elementProps}>
      <ParticipantContextIfNeeded participant={p}>
        {children ?? (
          <>
            <div className="lk-participant-metadata">
              <div className="lk-participant-metadata-item">
                <ParticipantName />
              </div>
              <div className="display-flex">
                <TrackMutedIndicator
                  trackRef={{
                    participant: p,
                    source: Track.Source.Microphone,
                  }}
                  show={'always'}
                ></TrackMutedIndicator>
                <TrackMutedIndicator
                  trackRef={{
                    participant: p,
                    source: Track.Source.Camera,
                  }}
                  show={'always'}
                ></TrackMutedIndicator>
              </div>
              {/* <ConnectionQualityIndicator className="lk-participant-metadata-item" /> */}
            </div>
          </>
        )}
      </ParticipantContextIfNeeded>
    </div>
  );
};