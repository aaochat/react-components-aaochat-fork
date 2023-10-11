import type {
  MessageDecoder,
  MessageEncoder,
  TrackReferenceOrPlaceholder,
  WidgetState,
} from '@livekit/components-core';
import { isEqualTrackRef, isTrackReference, isWeb, log, setupParticipantName } from '@livekit/components-core';
import { RoomEvent, Track } from 'livekit-client';
import * as React from 'react';
import type { MessageFormatter } from '../components';
import {
  CarouselLayout,
  ConnectionStateToast,
  FocusLayout,
  FocusLayoutContainer,
  GridLayout,
  LayoutContextProvider,
  ParticipantTile,
  RoomAudioRenderer,
} from '../components';
import { useCreateLayoutContext, useEnsureParticipant } from '../context';
import { useLocalParticipant, usePinnedTracks, useTracks } from '../hooks';
import { Chat } from './Chat';
import { ControlBar } from './ControlBar';
import { Users } from './Users';
import { ShareLink } from './ShareLink';
import { useObservableState } from '../hooks/internal';

/**
 * @public
 */
export interface VideoConferenceProps extends React.HTMLAttributes<HTMLDivElement> {
  chatMessageFormatter?: MessageFormatter;
  chatMessageEncoder?: MessageEncoder;
  chatMessageDecoder?: MessageDecoder;
}

/**
 * The `VideoConference` ready-made component is your drop-in solution for a classic video conferencing application.
 * It provides functionality such as focusing on one participant, grid view with pagination to handle large numbers
 * of participants, basic non-persistent chat, screen sharing, and more.
 *
 * @remarks
 * The component is implemented with other LiveKit components like `FocusContextProvider`,
 * `GridLayout`, `ControlBar`, `FocusLayoutContainer` and `FocusLayout`.
 * You can use this components as a starting point for your own custom video conferencing application.
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
  chatMessageDecoder,
  chatMessageEncoder,
  ...props
}: VideoConferenceProps) {
  const [widgetState, setWidgetState] = React.useState<WidgetState>({
    showChat: null,
    unreadMessages: 0,
  });

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

  // const [waiting, setWaiting] = React.useState<string | null>(null); // Used to show toast message
  const [waitingRoomCount, setWaitingRoomCount] = React.useState<number>(0);

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { updateOnlyOn: [RoomEvent.ActiveSpeakersChanged], onlySubscribed: false },
  );

  console.log(tracks);

  const widgetUpdate = (state: WidgetState) => {
    log.debug('updating widget state', state);
    console.log(state);

    setWidgetState(state);
  };

  const updateCount = (count: number) => {
    log.debug('count ', count);
    setWaitingRoomCount(count);
  };

  // const setWaitingMessage = (message: string) => {
  //   if (showParticipantButton) {
  //     setWaiting(message);
  //   }
  // };

  const layoutContext = useCreateLayoutContext();
  const screenShareTracks = tracks
    .filter(isTrackReference)
    .filter((track) => track.publication.source === Track.Source.ScreenShare);

  const focusTrack = usePinnedTracks(layoutContext)?.[0];
  const carouselTracks = tracks.filter((track) => !isEqualTrackRef(track, focusTrack));

  // React.useEffect(() => {
  //   if (waiting) {
  //     // Remove toast message after 2 second
  //     setTimeout(() => {
  //       setWaiting(null);
  //     }, 3000);
  //   }
  // }, [waiting]);

  React.useEffect(() => {
    if (meta && meta.host) {
      localStorage.setItem('host', meta.host);
      if (meta.limited) {
        localStorage.setItem('limited', meta.limited);
      }

      setShowShareButton(true);
      setShowParticipantButton(true);
      setLeaveButton("Leave Meeting");
      setEndForAll("End Meeting for All");
    }
  }, [meta]);

  React.useEffect(() => {
    const pmeta = p.metadata ? JSON.parse(p.metadata) : {};
    if (pmeta && pmeta.host) {
      localStorage.setItem('host', meta.host);
      if (meta.limited) {
        localStorage.setItem('limited', meta.limited);
      }

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
              />
            ) : (<></>)
          }

          {/* {
            waiting ? (
              <Toast className="lk-toast-connection-state">
                <UserToggle>{waiting}</UserToggle>
              </Toast>
            ) : (
              <></>
            )
          } */}
          <Chat
            style={{ display: widgetState.showChat == 'show_chat' ? 'flex' : 'none' }}
            messageFormatter={chatMessageFormatter}
            messageEncoder={chatMessageEncoder}
            messageDecoder={chatMessageDecoder}
          />
        </LayoutContextProvider >
      )
      }
      <RoomAudioRenderer />
      <ConnectionStateToast />
    </div >
  );
}
