import { Track } from 'livekit-client';
import * as React from 'react';
import { MediaDeviceMenu } from './MediaDeviceMenu';
import { HostEndMeetingMenu } from './HostEndMeetingMenu';
import { DisconnectButton } from '../components/controls/DisconnectButton';
import { TrackToggle } from '../components/controls/TrackToggle';
import { ChatIcon, GearIcon, LeaveIcon } from '../assets/icons';
import { ChatToggle } from '../components/controls/ChatToggle';
import { ShareLinkToggle } from '../components/controls/ShareLinkToggle';
import { UserToggle } from '../components/controls/UserToggle';
import SvgInviteIcon from '../assets/icons/tl/InviteIcon';
import SvgUserIcon from '../assets/icons/tl/UsersIcon';

import { useLocalParticipantPermissions, usePersistentUserChoices } from '../hooks';
import { useMediaQuery } from '../hooks/internal';
import { useLayoutContext, useMaybeLayoutContext } from '../context';
import { supportsScreenSharing } from '@livekit/components-core';
import { mergeProps } from '../utils';
import { ExtraOptionMenu } from './ExtraOptionMenu';
import { useWhiteboard } from '../hooks/useWhiteboard';
import { StartMediaButton } from '../components/controls/StartMediaButton';
import { SettingsMenuToggle } from '../components/controls/SettingsMenuToggle';

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
  settings?: boolean;
};

/** @public */
export interface ControlBarProps extends React.HTMLAttributes<HTMLDivElement> {
  variation?: 'minimal' | 'verbose' | 'textOnly';
  controls?: ControlBarControls;
  waitingRoomCount: number;
  screenShareTracks?: number;
  isWhiteboard?: boolean;
  saveUserChoices?: boolean;
  showExtraSettingMenu?: boolean;
}

/**
 * The `ControlBar` prefab gives the user the basic user interface to control their
 * media devices (camera, microphone and screen share), open the `Chat` and leave the room.
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
  isWhiteboard,
  saveUserChoices = true,
  showExtraSettingMenu,
  ...props
}: ControlBarProps) {
  const layoutContext = useMaybeLayoutContext();
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [isShareLinkOpen, setIsShareLinkOpen] = React.useState(false);
  const [isUserOpen, setIsUserOpen] = React.useState(false);
  const { state } = useLayoutContext().widget;

  React.useEffect(() => {
    if (layoutContext?.widget.state?.showChat == 'show_chat') {
      setIsChatOpen(layoutContext?.widget.state?.showChat == 'show_chat');
    } else if (layoutContext?.widget.state?.showChat == 'show_invite') {
      setIsShareLinkOpen(layoutContext?.widget.state?.showChat == 'show_invite');
    } else if (layoutContext?.widget.state?.showChat == 'show_users') {
      setIsUserOpen(layoutContext?.widget.state?.showChat == 'show_users');
    }
  }, [layoutContext?.widget.state?.showChat]);

  const { isWhiteboardShared } = useWhiteboard();

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

  const onScreenShareChange = React.useCallback(
    (enabled: boolean) => {
      setIsScreenShareEnabled(enabled);
    },
    [setIsScreenShareEnabled],
  );

  const htmlProps = mergeProps({ className: 'lk-control-bar' }, props);
  React.useEffect(() => {
    // Get all button elements with the "data-lk-source" attribute
    const buttons = document.querySelectorAll('[data-lk-source]');
    if (!isScreenShareEnabled && screenShareTracks !== 0) {
      // Loop through each button and check its "data-lk-source" attribute
      buttons.forEach((button) => {
        const source = button.getAttribute('data-lk-source');

        // Check if the "data-lk-source" attribute value is "screen_share"
        if (source === 'screen_share') {
          // Disable the button
          (button as HTMLButtonElement).disabled = true;
        }
      });
    } else {
      // Loop through each button and check its "data-lk-source" attribute
      buttons.forEach((button) => {
        const source = button.getAttribute('data-lk-source');

        // Check if the "data-lk-source" attribute value is "screen_share"
        if (source === 'screen_share') {
          // Disable the button
          (button as HTMLButtonElement).disabled = false;
        }
      });
    }
  }, [screenShareTracks, isScreenShareEnabled]);

  React.useEffect(() => {
    const buttons = document.querySelectorAll('[data-lk-source]');
    if (isWhiteboardShared) {
      buttons.forEach((button) => {
        const source = button.getAttribute('data-lk-source');
        if (source === 'screen_share') {
          (button as HTMLButtonElement).disabled = true;
        }
      });
    } else {
      buttons.forEach((button) => {
        const source = button.getAttribute('data-lk-source');
        if (source === 'screen_share') {
          (button as HTMLButtonElement).disabled = false;
        }
      });
    }
  }, [isWhiteboardShared]);

  const [sharescreenTitle, setSharescreenTitle] = React.useState('You can share your screen');

  React.useEffect(() => {
    if (!isScreenShareEnabled && screenShareTracks !== 0) {
      setSharescreenTitle('Someone has shared screen');
    } else if (isWhiteboardShared) {
      setSharescreenTitle('Whiteboard is shared');
    } else if (isScreenShareEnabled) {
      setSharescreenTitle("You're sharing your screen");
    } else {
      setSharescreenTitle('You can share your screen');
    }
  }, [isScreenShareEnabled, screenShareTracks, isWhiteboardShared]);

  const {
    saveAudioInputEnabled,
    saveVideoInputEnabled,
    saveAudioInputDeviceId,
    saveVideoInputDeviceId,
  } = usePersistentUserChoices({ preventSave: !saveUserChoices });

  const microphoneOnChange = React.useCallback(
    (enabled: boolean, isUserInitiated: boolean) =>
      isUserInitiated ? saveAudioInputEnabled(enabled) : null,
    [saveAudioInputEnabled],
  );

  const cameraOnChange = React.useCallback(
    (enabled: boolean, isUserInitiated: boolean) =>
      isUserInitiated ? saveVideoInputEnabled(enabled) : null,
    [saveVideoInputEnabled],
  );

  return (
    <div {...htmlProps}>
      {visibleControls.microphone && (
        <div className="lk-button-group">
          <TrackToggle
            source={Track.Source.Microphone}
            showIcon={showIcon}
            onChange={microphoneOnChange}
          >
            {showText && 'Microphone'}
          </TrackToggle>
          <div className="lk-button-group-menu">
            <MediaDeviceMenu
              initialSelection={'default'}
              kind="audioinput"
              onActiveDeviceChange={(_kind, deviceId) => saveAudioInputDeviceId(deviceId ?? '')}
            />
          </div>
        </div>
      )}
      {visibleControls.camera && (
        <div className="lk-button-group">
          <TrackToggle source={Track.Source.Camera} showIcon={showIcon} onChange={cameraOnChange}>
            {showText && 'Camera'}
          </TrackToggle>
          <div className="lk-button-group-menu">
            <MediaDeviceMenu
              kind="videoinput"
              onActiveDeviceChange={(_kind, deviceId) => saveVideoInputDeviceId(deviceId ?? '')}
            />
          </div>
        </div>
      )}
      {visibleControls.screenShare && browserSupportsScreenSharing && (
        <TrackToggle
          source={Track.Source.ScreenShare}
          captureOptions={{ audio: true, selfBrowserSurface: 'include' }}
          showIcon={showIcon}
          onChange={onScreenShareChange}
          disabled={!isScreenShareEnabled && screenShareTracks !== 0 && isWhiteboardShared}
          title={sharescreenTitle}
        >
          {showText && (isScreenShareEnabled ? 'Stop screen share' : 'Share screen')}
        </TrackToggle>
      )}
      {visibleControls.chat && (
        <ChatToggle>
          {showIcon && <ChatIcon />}
          {showText && 'Chat'}
          {state && state.unreadMessages !== 0 && (
            <span className="waiting-count">
              {state.unreadMessages < 10 ? state.unreadMessages.toFixed(0) : '9+'}
            </span>
          )}
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
      {showExtraSettingMenu && (
        <div className="lk-button-group">
          <div className="lk-button-group-menu">
            <ExtraOptionMenu blurEnabled={false} shareScreenTracks={screenShareTracks} />
          </div>
        </div>
      )}
      {visibleControls.endForAll ? (
        <div className="tl-leave lk-button-group">
          <div className="tl-leave-btn lk-button-group-menu">
            <HostEndMeetingMenu
              leave={visibleControls.leave}
              leaveButton={visibleControls.leaveButton}
              endForAll={visibleControls.endForAll}
              showIcon={showIcon}
              showText={showText}
            />
          </div>
        </div>
      ) : (
        <DisconnectButton>
          {showIcon && <LeaveIcon />}
          {showText && visibleControls.leaveButton}
        </DisconnectButton>
      )}
      {visibleControls.settings && (
        <SettingsMenuToggle>
          {showIcon && <GearIcon />}
          {showText && 'Settings'}
        </SettingsMenuToggle>
      )}

      <StartMediaButton />
    </div>
  );
}
