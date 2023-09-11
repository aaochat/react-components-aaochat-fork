import * as React from 'react';
import { LayoutContextProvider } from '../components/layout/LayoutContextProvider';
import { RoomAudioRenderer } from '../components/RoomAudioRenderer';
import { ControlBar } from './ControlBar';
import { FocusLayout, FocusLayoutContainer } from '../components/layout/FocusLayout';
import { GridLayout } from '../components/layout/GridLayout';
import type { WidgetState } from '@livekit/components-core';
import { ShareLink } from './ShareLink';
import { Users } from './Users';
import { isEqualTrackRef, isTrackReference, log, isWeb, setupParticipantName } from '@livekit/components-core';
// import { Chat } from './Chat';
import { ConnectionStateToast } from '../components/Toast';
// import type { MessageFormatter } from '../components/ChatEntry';
import { RoomEvent, ParticipantEvent, Track } from 'livekit-client';
import { useTracks } from '../hooks/useTracks';
import { usePinnedTracks } from '../hooks/usePinnedTracks';
import { CarouselLayout } from '../components/layout/CarouselLayout';
import { useCreateLayoutContext } from '../context/layout-context';
import { ParticipantTile } from '../components';
import { Toast } from '../components';
import { UserToggle } from '../components/controls/UserToggle';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { useLocalParticipant } from '../hooks';
import { MessageFormatter } from '../components/ChatEntry';
import { useEnsureParticipant, useRoomContext } from '../context';
import { useObservableState } from '../hooks/internal';
import { Chat } from './Chat';

/**
 * @public
 */
export interface VideoConferenceProps extends React.HTMLAttributes<HTMLDivElement> {
  chatMessageFormatter?: MessageFormatter;
  // showShareButton: boolean;
  // showParticipantButton: boolean;
  // leaveButton: string;
  // endForAll: string | false;
}

/**
 * This component is the default setup of a classic LiveKit video conferencing app.
 * It provides functionality like switching between participant grid view and focus view.
 *
 * @remarks
 * The component is implemented with other LiveKit components like `FocusContextProvider`,
 * `GridLayout`, `ControlBar`, `FocusLayoutContainer` and `FocusLayout`.
 *
 * @example
 * ```tsx
 * <LiveKitRoom>
 *   <VideoConference />
 * <LiveKitRoom>
 * ```
 * @public
 */
export function VideoConference({
  chatMessageFormatter,
  ...props
}: VideoConferenceProps) {
  const [widgetState, setWidgetState] = React.useState<WidgetState>({
    showChat: null,
    unreadMessages: 0,
  });
  console.log(widgetState);

  const lastAutoFocusedScreenShareTrack = React.useRef<TrackReferenceOrPlaceholder | null>(null);
  const { localParticipant } = useLocalParticipant();
  const p = useEnsureParticipant(localParticipant);

  const { infoObserver } = React.useMemo(() => {
    return setupParticipantName(p);
  }, [p]);

  const { metadata } = useObservableState(infoObserver, {
    name: p.name,
    identity: p.identity,
    metadata: p.metadata,
  });

  const [showShareButton, setShowShareButton] = React.useState<boolean>(false);
  const [showParticipantButton, setShowParticipantButton] = React.useState<boolean>(false);
  const [leaveButton, setLeaveButton] = React.useState<string>("Leave");
  const [endForAll, setEndForAll] = React.useState<string | false>(false);

  const meta = metadata ? JSON.parse(metadata) : {};

  const [waiting, setWaiting] = React.useState<string | null>(null); // Used to show toast message
  const [waitingRoomCount, setWaitingRoomCount] = React.useState<number>(0);

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { updateOnlyOn: [RoomEvent.ActiveSpeakersChanged], onlySubscribed: false },
  );

  const room = useRoomContext();
  room.on(ParticipantEvent.ParticipantMetadataChanged, (data) => {
    // console.log("track", track);
    console.log("data", data);
  });

  const widgetUpdate = (state: WidgetState) => {
    log.debug('updating widget state', state);
    console.log(state);

    setWidgetState(state);
  };

  const updateCount = (count: number) => {
    log.debug('count ', count);
    setWaitingRoomCount(count);
  };

  const setWaitingMessage = (message: string) => {
    if (showParticipantButton) {
      setWaiting(message);
    }
  };

  // RoomEvent.ParticipantMetadataChanged

  const layoutContext = useCreateLayoutContext();
  const screenShareTracks = tracks
    .filter(isTrackReference)
    .filter((track) => track.publication.source === Track.Source.ScreenShare);

  const focusTrack = usePinnedTracks(layoutContext)?.[0];
  const carouselTracks = tracks.filter((track) => !isEqualTrackRef(track, focusTrack));

  React.useEffect(() => {
    if (waiting) {
      // Remove toast message after 2 second
      setTimeout(() => {
        setWaiting(null);
      }, 3000);
    }
  }, [waiting]);

  React.useEffect(() => {
    console.log("Initial meta update", new Date());
    console.log(meta);

    if (meta && meta.host) {
      setShowShareButton(true);
      setShowParticipantButton(true);
      setLeaveButton("Leave Meeting");
      setEndForAll("End Meeting for All");
    }
  }, [meta]);

  React.useEffect(() => {
    console.log("P data update", new Date());
    const pmeta = p.metadata ? JSON.parse(p.metadata) : {};
    if (pmeta && pmeta.host) {
      setShowShareButton(true);
      setShowParticipantButton(true);
      setLeaveButton("Leave Meeting");
      setEndForAll("End Meeting for All");
    }
  }, [p]);


  React.useEffect(() => {
    // If screen share tracks are published, and no pin is set explicitly, auto set the screen share.
    if (
      screenShareTracks.some((track) => track.publication.isSubscribed) &&
      lastAutoFocusedScreenShareTrack.current === null
    ) {
      log.debug('Auto set screen share focus:', { newScreenShareTrack: screenShareTracks[0] });
      layoutContext.pin.dispatch?.({ msg: 'set_pin', trackReference: screenShareTracks[0] });
      lastAutoFocusedScreenShareTrack.current = screenShareTracks[0];
    } else if (
      lastAutoFocusedScreenShareTrack.current &&
      !screenShareTracks.some(
        (track) =>
          track.publication.trackSid ===
          lastAutoFocusedScreenShareTrack.current?.publication?.trackSid,
      )
    ) {
      log.debug('Auto clearing screen share focus.');
      layoutContext.pin.dispatch?.({ msg: 'clear_pin' });
      lastAutoFocusedScreenShareTrack.current = null;
    }
  }, [
    screenShareTracks
      .map((ref) => `${ref.publication.trackSid}_${ref.publication.isSubscribed}`)
      .join(),
    focusTrack?.publication?.trackSid,
  ]);

  return (
    <div className="lk-video-conference" {...props}>
      {isWeb() && (
        <LayoutContextProvider
          value={layoutContext}
          // onPinChange={handleFocusStateChange}
          onWidgetChange={widgetUpdate}
        >
          <div className="lk-video-conference-inner">
            {!focusTrack ? (
              <div className="lk-grid-layout-wrapper">
                <GridLayout tracks={tracks}>
                  <ParticipantTile />
                </GridLayout>
              </div>
            ) : (
              <div className="lk-focus-layout-wrapper">
                <FocusLayoutContainer>
                  <CarouselLayout tracks={carouselTracks}>
                    <ParticipantTile />
                  </CarouselLayout>
                  {focusTrack && <FocusLayout trackRef={focusTrack} />}
                </FocusLayoutContainer>
              </div>
            )}
            <ControlBar
              controls={{
                chat: true,
                sharelink: showShareButton,
                users: showParticipantButton,
                leaveButton: leaveButton,
                endForAll: endForAll,
              }}
              waitingRoomCount={waitingRoomCount}
              screenShareTracks={screenShareTracks.length}
            />
          </div >

          {
            showShareButton ?
              (
                <ShareLink style={{
                  display: widgetState.showChat == 'show_invite' ? 'flex' : 'none'
                }
                } />
              ) : (
                <></>
              )
          }

          {
            showParticipantButton ? (
              <Users
                style={{ display: widgetState.showChat == 'show_users' ? 'flex' : 'none' }}
                onWaitingRoomChange={updateCount}
                setWaiting={setWaitingMessage}
              />
            ) : (<></>)
          }

          {
            waiting ? (
              <Toast className="lk-toast-connection-state">
                <UserToggle>{waiting}</UserToggle>
              </Toast>
            ) : (
              <></>
            )
          }
          <Chat
            style={{ display: widgetState.showChat == 'show_chat' ? 'flex' : 'none' }}
            messageFormatter={chatMessageFormatter}
          />
        </LayoutContextProvider >
      )
      }
      <RoomAudioRenderer />
      <ConnectionStateToast />
    </div >
  );
}
