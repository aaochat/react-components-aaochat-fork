import { computeMenuPosition, wasClickOutside } from '@livekit/components-core';
import * as React from 'react';
import { DisconnectButton } from '../components';
import { LeaveIcon } from '../assets/icons';
import { useRoomContext } from '../context';

/** @public */
export interface HostEndMeetingMenuProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  leave?: string;
  leaveButton?: string;
  endForAll?: string;
  showIcon?: boolean;
  showText?: boolean;
}

/**
 * The MediaDeviceMenu prefab component is a button that opens a menu that lists
 * all media devices and allows the user to select them.
 *
 * @example
 * ```tsx
 * <LiveKitRoom>
 *   <HostEndMeetingMenu />
 * </LiveKitRoom>
 * ```
 * @public
 */
export function HostEndMeetingMenu({
  leave,
  leaveButton,
  endForAll,
  showIcon,
  showText,
  ...props
}: any) {
  const [isOpen, setIsOpen] = React.useState(false);
  const room = useRoomContext();

  const button = React.useRef<HTMLButtonElement>(null);
  const tooltip = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    if (button.current && tooltip.current) {
      computeMenuPosition(button.current, tooltip.current).then(({ x, y }) => {
        if (tooltip.current) {
          Object.assign(tooltip.current.style, { left: `${x}px`, top: `${y}px` });
        }
      });
    }
  }, [button, tooltip]);

  const handleClickOutside = React.useCallback(
    (event: MouseEvent) => {
      if (!tooltip.current) {
        return;
      }
      if (event.target === button.current) {
        return;
      }
      if (isOpen && wasClickOutside(tooltip.current, event)) {
        setIsOpen(false);
      }
    },
    [isOpen, tooltip, button],
  );

  React.useEffect(() => {
    document.addEventListener<'click'>('click', handleClickOutside);
    // window.addEventListener<'resize'>('resize', () => setUpdateRequired(true));
    return () => {
      document.removeEventListener<'click'>('click', handleClickOutside);
      // window.removeEventListener<'resize'>('resize', () => setUpdateRequired(true));
    };
  }, [handleClickOutside]);

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
    <>
      <button
        className="lk-button lk-button-menu"
        aria-pressed={isOpen}
        {...props}
        onClick={() => setIsOpen(!isOpen)}
        ref={button}
      >
        {props.children}
      </button>
      {/** only render when enabled in order to make sure that the permissions are requested only if the menu is enabled */}
      {!props.disabled && (
        <div
          className="lk-device-menu"
          ref={tooltip}
          style={{ visibility: isOpen ? 'visible' : 'hidden' }}
        >
          <ul className="lk-media-device-select lk-list">
            {leave && (
              <li id="" data-lk-active="true" aria-selected="true" role="option">
                <DisconnectButton>
                  {showIcon && <LeaveIcon />}
                  {showText && leaveButton}
                </DisconnectButton>
              </li>
            )}
            {endForAll && (
              <li id="" data-lk-active="true" aria-selected="true" role="option">
                <DisconnectButton onClick={endMeeting}>
                  {showIcon && <LeaveIcon />}
                  {showText && endForAll}
                </DisconnectButton>
              </li>
            )}
          </ul>
        </div>
      )}
    </>
  );
}
