import { computeMenuPosition, setupDisconnectButton, wasClickOutside } from '@livekit/components-core';
import * as React from 'react';
import { DisconnectButton } from '../components';
// import { LeaveIcon } from '../assets/icons';
import { useRoomContext } from '../context';
import { useLocalParticipant, useParticipants } from '../hooks';

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
  const leaveButtonRef = React.useRef<HTMLButtonElement>(null);
  const tooltip = React.useRef<HTMLDivElement>(null);

  const { disconnect } = setupDisconnectButton(room);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [value, setValue] = React.useState("");

  const participants = useParticipants(); // List of joined participant
  const { localParticipant } = useLocalParticipant();
  const remoteParticipants = participants.filter(participant => participant.identity !== localParticipant.identity);

  const meta = localParticipant.metadata ? JSON.parse(localParticipant.metadata) : {};

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

      if (event.target === leaveButtonRef.current) {
        return;
      }

      if (event.target === button.current) {
        return;
      }


      if (isOpen && wasClickOutside(tooltip.current, event)) {
        setIsOpen(false);
        setShowDropdown(false);
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
    const postData = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        room: room.name,
        identity: identity,
        token: meta.host
      }),
    };
    await fetch(`/api/make-host`, postData).then(async (res) => {
      if (res.ok) {
        console.log("Host leave and new host assigned");
        disconnect(true);
        setIsOpen(false);
        setShowDropdown(false);
      } else {
        throw Error('Error fetching server url, check server logs');
      }
    });
  }


  const handleChange = () => {
    setIsOpen(false);
    setValue(value);
    makeNewHost(value);
  };

  const handleLeave = () => {
    if (remoteParticipants.length) {
      console.log("Openning dropdown");
      setShowDropdown(true);
      setIsOpen(true);
    } else {
      console.log("No Participant present to leaving meeting");
      disconnect(true);
    }
  }

  const handleCancel = () => {
    setShowDropdown(false);
  }

  const handleChangeValue = (e: { target: { value: React.SetStateAction<string>; }; }) => {
    setValue(e.target.value);
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
      <div
        className="lk-device-menu"
        ref={tooltip}
        style={{ visibility: isOpen ? 'visible' : 'hidden' }}
      >
        <ul className="lk-media-device-select lk-list" style={{ display: !showDropdown ? 'unset' : 'none' }}>
          {endForAll && (
            <li>
              <DisconnectButton onClick={endMeeting}>
                {endForAll}
              </DisconnectButton>
            </li>
          )}
          {leave && (
            <li>
              <button ref={leaveButtonRef} className="lk-disconnect-button" onClick={handleLeave}>
                Leave Meeting
              </button>
            </li>
          )}
        </ul>

        {showDropdown && (
          <div className='assign-menu'>
            <select value={value} onChange={handleChangeValue}>
              {remoteParticipants.map((participant) => (
                <option value={participant.identity} key={participant.identity}>{(participant?.name)?.substring(0, 10)}</option>
              ))}
            </select>

            <div className='button-container'>
              <button className='lk-button' onClick={handleCancel}>Cancel</button>
              <button className='lk-button' onClick={handleChange}>Ok</button>
            </div>
          </div>
        )}
        <div className="arrow">
          <div className="arrow-shape"></div>
        </div>
      </div>
    </>
  );
}
