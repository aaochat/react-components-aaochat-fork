/* eslint-disable prettier/prettier */
import * as React from 'react';
import { useParticipants } from '../hooks';
import { ParticipantLoop } from '../components';
import { ParticipantList } from '../components/participant/ParticipantList';
import { useRoomContext } from '../context';
import type { LocalUserChoices } from './PreJoin';
import { ToggleSwitch } from '../components/ToggleSwitch';
import SvgApproveIcon from '../assets/icons/ApproveIcon';
import SvgRejectIcon from '../assets/icons/RejectIcon';

/** @public */
export interface UserProps extends React.HTMLAttributes<HTMLDivElement> {
  onWaitingRoomChange: (state: number) => void;
  // setWaiting: (state: string) => void;
}

export type UserDataProps = {
  /** The participants to loop over.
   * If not provided, the participants from the current room context are used.
   **/
  participants: LocalUserChoices[];
};

export function Users({ onWaitingRoomChange, ...props }: UserProps) {
  const ulRef = React.useRef<HTMLUListElement>(null);
  const participants = useParticipants(); // List of joined participant
  const [waitingRoom, setWaitingRoom] = React.useState<any[]>([]); // List of users in waiting room
  const [toggleWaiting, setToggleWaiting] = React.useState<boolean>(true); // Enable / Disable waiting room

  const room = useRoomContext();
  // const decoder = new TextDecoder();

  // async function muteAllMircophone() {
  // room.participants.forEach((participant) => {
  //   const p = room.localParticipant;
  // });
  // await p.setCameraEnabled(false);
  // }

  /**
   * Get list of users in waiting room
   */
  async function getWaitingRoomState() {
    const postData = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        meeting_id: room.name,
      }),
    };
    fetch(`/api/get-waitingroom-state`, postData).then(async (res) => {
      if (res.ok) {
        const body = await res.json();
        setToggleWaiting(body.waiting_room);
      } else {
        throw Error('Error fetching server url, check server logs');
      }
    });
  }
  /**
   * Get list of users in waiting room
   */
  async function usersList() {
    const postData = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        meeting_id: room.name,
      }),
    };
    fetch(`/api/get-waiting-room-users`, postData).then(async (res) => {
      if (res.ok) {
        const body = await res.json();
        setWaitingRoom(body.users);
      } else {
        throw Error('Error fetching server url, check server logs');
      }
    });
  }

  React.useEffect(() => {
    // Updating list user count in waiting room to parent component
    if (room.name) {
      usersList();
    }
  }, [room.name]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      usersList();
      // setWaiting(`Users are in waiting room`)
    }, 2000)
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    getWaitingRoomState();
  }, []);

  React.useEffect(() => {
    // Updating list user count in waiting room to parent component
    onWaitingRoomChange(waitingRoom.length);
  }, [onWaitingRoomChange, waitingRoom]);

  React.useEffect(() => {
    if (ulRef) {
      ulRef.current?.scrollTo({ top: ulRef.current.scrollHeight });
    }
  }, [ulRef]);

  /**
   * Accept or reject user from waiting room
   *
   * @param username Username
   * @param type Accept or Reject
   */
  async function admitUser(identity: string, type: string) {
    const postData = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ room: room.name, identity: identity, type: type }),
    };

    fetch(`/api/accept-request`, postData).then(async (res) => {
      if (res.status) {
        const remaining = waitingRoom.filter(
          (item: any) => item.identity !== identity,
        );
        setWaitingRoom(remaining);
      } else {
        throw Error('Error fetching server url, check server logs');
      }
    });
  }

  /**
   * Approve all participant from waiting room
   *
   */
  async function approveAll() {
    const postData = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ meeting_id: room.name }),
    };

    fetch(`/api/approve-all-participant`, postData).then(async (res) => {
      if (res.status) {
        setWaitingRoom([]);
      } else {
        throw Error('Error fetching server url, check server logs');
      }
    });
  }

  /**
   * Toggle waiting room to enable or disable
   *
   * @param checked
   */
  const onToggleWaitingChange = (checked: any) => {
    const postData = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ room: room.name, waiting_room: checked }),
    };

    fetch(`/api/set-waitingroom`, postData).then(async (res) => {
      if (res.status) {
        setToggleWaiting(checked);
      } else {
        throw Error('Error fetching server url, check server logs');
      }
    });
  };

  return (
    <div {...props} className="lk-chat lk-users">
      <div className="lk-waitinroom">
        <div className="tl-waitingroom-heading">
          <h3>Waiting Room</h3>

          <div className="tl-toggle-switch">
            <ToggleSwitch
              id="toggleSwitch"
              checked={toggleWaiting}
              onChange={onToggleWaitingChange}
              name={'toggleSwitch'}
              optionLabels={['On', 'Off']}
              small={false}
              disabled={false}
            />
          </div>

          {toggleWaiting && waitingRoom.length
            ?
            <button
              className="lk-button tl-info tl-approve"
              onClick={() => approveAll()}
            >
              Approve All
            </button>
            :
            ""
          }
        </div>

        {waitingRoom.map((item: any) => (
          <div className="tl-participant-li" key={item.username}>
            <div className="lk-participant-metadata">
              <div className="lk-participant-metadata-item">{item.username}</div>
              <div className="display-flex">
                <button
                  className="lk-button lk-waiting-room lk-success"
                  onClick={() => admitUser(item.identity, 'accepted')}
                >
                  <SvgApproveIcon />
                </button>
                <button
                  className="lk-button lk-waiting-room lk-danger"
                  onClick={() => admitUser(item.identity, 'rejected')}
                >
                  <SvgRejectIcon />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="lk-participants">
        <div className="tl-participants-heading">
          <h3>Participants  <span>({participants.length})</span></h3>
        </div>
        {participants?.length ? (
          <ParticipantLoop participants={participants}>
            <ParticipantList />
          </ParticipantLoop>
        ) : (
          <div>
            <h5>No Participants</h5>
          </div>
        )}
      </div>
    </div>
  );
}
