import { Track } from 'livekit-client';
import * as React from 'react';
import { MediaDeviceMenu } from './MediaDeviceMenu';
import { DisconnectButton } from '../components/controls/DisconnectButton';
import { TrackToggle } from '../components/controls/TrackToggle';
import { StartAudio } from '../components/controls/StartAudio';
import { ChatIcon, LeaveIcon } from '../assets/icons';
import { ChatToggle } from '../components/controls/ChatToggle';
import { ShareLinkToggle } from '../components/controls/ShareLinkToggle';
import { isMobileBrowser } from '@livekit/components-core';
import { useLocalParticipantPermissions } from '../hooks';
import { useMediaQuery } from '../hooks/internal';
import { useMaybeLayoutContext } from '../context';

/** @public */
export type ControlBarControls = {
  microphone?: boolean;
  camera?: boolean;
  chat?: boolean;
  screenShare?: boolean;
  leave?: boolean;
  sharelink?: boolean;
  users?: boolean;
};

/** @public */
export type ControlBarProps = React.HTMLAttributes<HTMLDivElement> & {
  variation?: 'minimal' | 'verbose' | 'textOnly';
  controls?: ControlBarControls;
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
export function ControlBar({ variation, controls, ...props }: ControlBarProps) {
  const layoutContext = useMaybeLayoutContext();
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  React.useEffect(() => {
    if (layoutContext?.widget.state?.showChat !== undefined) {
      setIsChatOpen(layoutContext?.widget.state?.showChat);
    }
  }, [layoutContext?.widget.state?.showChat]);

  // Participant list for control the action of user
  const [isUserOpen, setIsUserOpen] = React.useState(false);
  React.useEffect(() => {
    if (layoutContext?.widget.state?.showUser !== undefined) {
      setIsUserOpen(layoutContext?.widget.state?.showUser);
    }
  }, [layoutContext?.widget.state?.showUser]);

  // Share join link option for participant
  const [isShareLinkOpen, setIsShareLinkOpen] = React.useState(false);
  React.useEffect(() => {
    if (layoutContext?.widget.state?.showShareLink !== undefined) {
      setIsShareLinkOpen(layoutContext?.widget.state?.showShareLink);
    }
  }, [layoutContext?.widget.state?.showShareLink]);

  const isTooLittleSpace = useMediaQuery(
    `(max-width: ${isChatOpen || isUserOpen || isShareLinkOpen ? 1000 : 760}px)`,
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

  const isMobile = React.useMemo(() => isMobileBrowser(), []);

  const [isScreenShareEnabled, setIsScreenShareEnabled] = React.useState(false);

  const onScreenShareChange = (enabled: boolean) => {
    setIsScreenShareEnabled(enabled);
  };

  return (
    <div className="lk-control-bar" {...props}>
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
      {visibleControls.screenShare && !isMobile && (
        <TrackToggle
          source={Track.Source.ScreenShare}
          captureOptions={{ audio: true, selfBrowserSurface: 'include' }}
          showIcon={showIcon}
          onChange={onScreenShareChange}
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
          {showIcon && <ChatIcon />}
          {showText && 'Invite'}
        </ShareLinkToggle>
      )}
      {visibleControls.users && (
        <ChatToggle>
          {showIcon && <ChatIcon />}
          {showText && 'Participants'}
        </ChatToggle>
      )}
      {visibleControls.leave && (
        <DisconnectButton>
          {showIcon && <LeaveIcon />}
          {showText && 'Leave'}
        </DisconnectButton>
      )}
      <StartAudio label="Start Audio" />
    </div>
  );
}
