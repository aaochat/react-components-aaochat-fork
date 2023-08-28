import { Track } from 'livekit-client';
import * as React from 'react';
import { MediaDeviceMenu } from './MediaDeviceMenu';
import { DisconnectButton } from '../components/controls/DisconnectButton';
import { TrackToggle } from '../components/controls/TrackToggle';
import { StartAudio } from '../components/controls/StartAudio';
import { ChatIcon, LeaveIcon } from '../assets/icons';
import { ChatToggle } from '../components/controls/ChatToggle';
import { ShareLinkToggle } from '../components/controls/ShareLinkToggle';
import { UserToggle } from '../components/controls/UserToggle';
import SvgInviteIcon from '../assets/icons/InviteIcon';
import SvgUserIcon from '../assets/icons/UsersIcon';
import { useLocalParticipantPermissions } from '../hooks';
import { useMediaQuery } from '../hooks/internal';
import { useMaybeLayoutContext, useRoomContext } from '../context';
import { supportsScreenSharing } from '@livekit/components-core';
import { mergeProps } from '../utils';

/** @public */
export type ControlBarControls = {
  microphone?: boolean;
  camera?: boolean;
  chat?: boolean;
  screenShare?: boolean;
  leave?: boolean;
  sharelink?: boolean;
  users?: boolean;
  leaveButton?: string;
  endForAll?: string | false;
};

/** @public */
export interface ControlBarProps extends React.HTMLAttributes<HTMLDivElement> {
  variation?: 'minimal' | 'verbose' | 'textOnly';
  controls?: ControlBarControls;
  waitingRoomCount: number;
  screenShareTracks?: number;
};

/**
 * The ControlBar prefab component gives the user the basic user interface
 * to control their media devices and leave the room.
 *
 * @remarks
 * This component is build with other LiveKit components like `TrackToggle`,
 * `DeviceSelectorButton`, `DisconnectButton` and `StartAudio`.
 *
 * @example
 * ```tsx
 * <LiveKitRoom>
 *   <ControlBar />
 * </LiveKitRoom>
 * ```
 * @public
 */
export function ControlBar({
  variation,
  controls,
  waitingRoomCount,
  screenShareTracks,
  ...props
}: ControlBarProps) {
  const layoutContext = useMaybeLayoutContext();
  const room = useRoomContext();
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [isShareLinkOpen, setIsShareLinkOpen] = React.useState(false);
  const [isUserOpen, setIsUserOpen] = React.useState(false);

  React.useEffect(() => {
    if (layoutContext?.widget.state?.showChat == 'show_chat') {
      setIsChatOpen(layoutContext?.widget.state?.showChat == 'show_chat');
    } else if (layoutContext?.widget.state?.showChat == 'show_invite') {
      setIsShareLinkOpen(layoutContext?.widget.state?.showChat == 'show_invite');
    } else if (layoutContext?.widget.state?.showChat == 'show_users') {
      setIsUserOpen(layoutContext?.widget.state?.showChat == 'show_users');
    }
  }, [layoutContext?.widget.state?.showChat]);

  const isTooLittleSpace = useMediaQuery(
    `(max-width: ${isChatOpen || isShareLinkOpen || isUserOpen ? 1000 : 760}px)`,
  );

  const defaultVariation = isTooLittleSpace ? 'minimal' : 'verbose';
  variation ??= defaultVariation;

  const visibleControls = { leave: true, ...controls };

  const localPermissions = useLocalParticipantPermissions();

  if (!localPermissions) {
    visibleControls.camera = false;
    visibleControls.chat = false;
    visibleControls.microphone = false;
    visibleControls.screenShare = false;
    visibleControls.sharelink = false;
    visibleControls.users = false;
  } else {
    visibleControls.camera ??= localPermissions.canPublish;
    visibleControls.microphone ??= localPermissions.canPublish;
    visibleControls.screenShare ??= localPermissions.canPublish;
    visibleControls.chat ??= localPermissions.canPublishData && controls?.chat;
    visibleControls.sharelink ??= localPermissions.canPublishData && controls?.sharelink;
    visibleControls.users ??= localPermissions.canPublishData && controls?.users;
  }

  const showIcon = React.useMemo(
    () => variation === 'minimal' || variation === 'verbose',
    [variation],
  );
  const showText = React.useMemo(
    () => variation === 'textOnly' || variation === 'verbose',
    [variation],
  );

  const browserSupportsScreenSharing = supportsScreenSharing();

  const [isScreenShareEnabled, setIsScreenShareEnabled] = React.useState(false);

  const onScreenShareChange = (enabled: boolean) => {
    setIsScreenShareEnabled(enabled);
  };

  const htmlProps = mergeProps({ className: 'lk-control-bar' }, props);

  /**
   * Get list of users in waiting room
   */
  async function endMeeting() {
    const postData = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        room: room.name,
      }),
    };
    fetch(`/api/end-meeting`, postData).then(async (res) => {
      if (res.ok) {
        console.log("Meeting ended");

      } else {
        throw Error('Error fetching server url, check server logs');
      }
    });
  }

  return (
    <div {...htmlProps}>
      {visibleControls.microphone && (
        <div className="lk-button-group">
          <TrackToggle source={Track.Source.Microphone} showIcon={showIcon}>
            {showText && 'Microphone'}
          </TrackToggle>
          <div className="lk-button-group-menu">
            <MediaDeviceMenu kind="audioinput" />
          </div>
        </div>
      )}
      {visibleControls.camera && (
        <div className="lk-button-group">
          <TrackToggle source={Track.Source.Camera} showIcon={showIcon}>
            {showText && 'Camera'}
          </TrackToggle>
          <div className="lk-button-group-menu">
            <MediaDeviceMenu kind="videoinput" />
          </div>
        </div>
      )}
      {visibleControls.screenShare && browserSupportsScreenSharing && (
        <TrackToggle
          source={Track.Source.ScreenShare}
          captureOptions={{ audio: true, selfBrowserSurface: 'include' }}
          showIcon={showIcon}
          onChange={onScreenShareChange}
          disabled={!isScreenShareEnabled && screenShareTracks !== 0}
          title={
            !isScreenShareEnabled && screenShareTracks !== 0
              ? 'Someone has shared screen'
              : isScreenShareEnabled
                ? "You're sharing your scrren"
                : 'You can share your screen'
          }
        >
          {showText && (isScreenShareEnabled ? 'Stop screen share' : 'Share screen')}
        </TrackToggle>
      )}
      {visibleControls.chat && (
        <ChatToggle>
          {showIcon && <ChatIcon />}
          {showText && 'Chat'}
        </ChatToggle>
      )}
      {visibleControls.sharelink && (
        <ShareLinkToggle>
          {showIcon && <SvgInviteIcon />}
          {showText && 'Invite'}
        </ShareLinkToggle>
      )}
      {visibleControls.users && (
        <UserToggle>
          {showIcon && <SvgUserIcon />}
          {showText && 'Participants'}
          {waitingRoomCount !== 0 && <span className="waiting-count">{waitingRoomCount}</span>}
        </UserToggle>
      )}
      {visibleControls.endForAll ? (
        <div className='tl-leave'>
          <button className="lk-disconnect-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"><path fill="currentColor" fill-rule="evenodd" d="M2 2.75A2.75 2.75 0 0 1 4.75 0h6.5A2.75 2.75 0 0 1 14 2.75v10.5A2.75 2.75 0 0 1 11.25 16h-6.5A2.75 2.75 0 0 1 2 13.25v-.5a.75.75 0 0 1 1.5 0v.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V2.75c0-.69-.56-1.25-1.25-1.25h-6.5c-.69 0-1.25.56-1.25 1.25v.5a.75.75 0 0 1-1.5 0v-.5Z" clip-rule="evenodd"></path><path fill="currentColor" fill-rule="evenodd" d="M8.78 7.47a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 1 1-1.06-1.06l.97-.97H1.75a.75.75 0 0 1 0-1.5h4.69l-.97-.97a.75.75 0 0 1 1.06-1.06l2.25 2.25Z" clip-rule="evenodd"></path></svg>
            {visibleControls.leaveButton}
          </button>

          <div className='tl-leave-btn'>
            <ul className='lk-list'>
              {visibleControls.leave && (
                <li id="" data-lk-active="true" aria-selected="true" role="option">
                  <DisconnectButton>
                    {showIcon && <LeaveIcon />}
                    {showText && visibleControls.leaveButton}
                  </DisconnectButton>
                </li>
              )}
              {visibleControls.endForAll && (
                <li id="" data-lk-active="true" aria-selected="true" role="option">
                  <DisconnectButton onClick={endMeeting}>
                    {showIcon && <LeaveIcon />}
                    {showText && visibleControls.endForAll}
                  </DisconnectButton>
                </li>
              )}
            </ul>
          </div>
        </div>

      ) : (
        <DisconnectButton>
          {showIcon && <LeaveIcon />}
          {showText && visibleControls.leaveButton}
        </DisconnectButton>
      )}
      <StartAudio label="Start Audio" />
    </div>
  );
}
