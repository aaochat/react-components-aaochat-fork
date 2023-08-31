import { computeMenuPosition, setupDisconnectButton, wasClickOutside } from '@livekit/components-core';
import * as React from 'react';
import { DisconnectButton } from '../components';
// import { LeaveIcon } from '../assets/icons';
import { useRoomContext } from '../context';
import { useParticipants, useRoomInfo } from '../hooks';

/** @public */
export interface HostEndMeetingMenuProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  leave?: string;
  leaveButton?: string;
  endForAll?: string;
  showIcon?: boolean;
  showText?: boolean;
}

/**
 * The HostEndMeetingMenu prefab component is a button that opens a menu lists that use to leave or end meeting for host
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
  const [updateRequired, setUpdateRequired] = React.useState<boolean>(true);

  const room = useRoomContext();
  const button = React.useRef<HTMLButtonElement>(null);
  const tooltip = React.useRef<HTMLDivElement>(null);
  const { metadata } = useRoomInfo();
  const [host, setHost] = React.useState<any | undefined>([]);

  const participants = useParticipants(); // List of joined participant

  React.useLayoutEffect(() => {
    if (button.current && tooltip.current && updateRequired) {
      computeMenuPosition(button.current, tooltip.current).then(({ x, y }) => {
        console.log(x, y);

        if (tooltip.current) {
          Object.assign(tooltip.current.style, { left: `${x}px`, top: `${y + 5}px` });
        }
      });
      setUpdateRequired(false);
    }
  }, [button, tooltip, updateRequired]);

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
    window.addEventListener<'resize'>('resize', () => setUpdateRequired(true));
    return () => {
      document.removeEventListener<'click'>('click', handleClickOutside);
      window.removeEventListener<'resize'>('resize', () => setUpdateRequired(true));
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

  /**
   * Set new host from participant list
   */
  async function makeNewHost(identity: any) {
    let hostId = host.hostId;
    console.log(hostId);

    hostId.push(identity);

    const postData = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        hosts: hostId,
      }),
    };
    fetch(`/api/make-host`, postData).then(async (res) => {
      if (res.ok) {
        console.log("Meeting ended");
        disconnect(true);
      } else {
        throw Error('Error fetching server url, check server logs');
      }
    });
  }

  const getInitialState = () => {
    const value = host;
    return value;
  };

  const { disconnect } = setupDisconnectButton(room);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [value, setValue] = React.useState(getInitialState);

  const handleChange = (e: { target: { value: any; }; }) => {
    setValue(e.target.value);
    makeNewHost(e.target.value);
  };

  const handleLeave = () => {
    if (host) {
      setShowDropdown(true);
    } else {
      console.log("Host data");
      console.log(host);
    }
  }
  const handleCancel = () => {
    setShowDropdown(false);
  }

  React.useEffect(() => {
    if (metadata) {
      setHost(JSON.parse(metadata));
    }
  }, [metadata]);

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
      <div
        className="lk-device-menu"
        ref={tooltip}
        style={{ visibility: isOpen ? 'visible' : 'hidden' }}
      >
        {!showDropdown && (
          <ul className="lk-media-device-select lk-list">
            {endForAll && (
              <li data-lk-active="true" aria-selected="true" role="option">
                <DisconnectButton onClick={endMeeting}>
                  {/* <LeaveIcon /> */}
                  {endForAll}
                </DisconnectButton>
              </li>
            )}
            {leave && (
              <li data-lk-active="true" aria-selected="true" role="option">
                <button className="lk-disconnect-button" onClick={handleLeave}>
                  Leave Meeting
                </button>
              </li>
            )}
          </ul>
        )}

        {showDropdown && (
          <div>
            <select value={value} onChange={handleChange}>
              {participants.map((participant) => (
                <option value={participant.identity} key={participant.identity}>
                  {participant.name}
                </option>
              ))}
            </select>

            <button className='lk-button' onClick={handleCancel}>Cancel</button>
          </div>
        )}
        <div className="arrow">
          <div className="arrow-shape"></div>
        </div>
      </div>
    </>
  );
}
