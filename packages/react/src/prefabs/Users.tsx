import * as React from 'react';
import { useParticipants } from '../hooks';
import { ParticipantLoop } from '../components';
import { ParticipantList } from '../components/participant/ParticipantList';
import { useRoomContext } from '../context';
import { RoomEvent } from 'livekit-client';
import type { LocalUserChoices } from './PreJoin';
import { ToggleSwitch } from '../components/ToggleSwitch';
/** @public */
export interface UserProps extends React.HTMLAttributes<HTMLDivElement> {
  onWaitingRoomChange: (state: number) => void;
}
export type UserDataProps = {
  /** The participants to loop over.
   * If not provided, the participants from the current room context are used.
   **/
  participants: LocalUserChoices[];
};

export function Users({ onWaitingRoomChange, ...props }: UserProps) {
  const ulRef = React.useRef<HTMLUListElement>(null);
  const participants = useParticipants();
  const [waitingRoom, setWaitingRoom] = React.useState<LocalUserChoices[]>([]);
  const room = useRoomContext();
  const decoder = new TextDecoder();
  const [toggleWaiting, setToggleWaiting] = React.useState<boolean>(true);

  // async function muteAllMircophone() {
  // room.participants.forEach((participant) => {
  //   const p = room.localParticipant;
  // });
  // await p.setCameraEnabled(false);
  // }

  room.on(RoomEvent.DataReceived, (payload: Uint8Array) => {
    const strData = JSON.parse(decoder.decode(payload));

    if (strData.type == 'joining') {
      const newUser = strData.data;
      const isExist = waitingRoom.find((item: any) => item.username == newUser.username);

      if (!isExist) {
        if (waitingRoom.length == 0) {
          setWaitingRoom([newUser]);
        } else {
          setWaitingRoom([...waitingRoom, newUser]);
        }
      }
    }
  });

  React.useEffect(() => {
    console.log('Calling onWaitingRoomChange', waitingRoom.length);
    onWaitingRoomChange(waitingRoom.length);
  }, [onWaitingRoomChange, waitingRoom]);

  React.useEffect(() => {
    if (ulRef) {
      ulRef.current?.scrollTo({ top: ulRef.current.scrollHeight });
    }
  }, [ulRef]);

  async function admitUser(username: string, type: string) {
    const postData = {
      method: 'POST',
      body: JSON.stringify({ room: room.name, username: username, type: type }),
    };
    fetch(`/api/accept-request`, postData).then(async (res) => {
      if (res.status) {
        const remaining = waitingRoom.filter(
          (item: LocalUserChoices) => item.username !== username,
        );
        setWaitingRoom(remaining);
      } else {
        throw Error('Error fetching server url, check server logs');
      }
    });
  }

  const onToggleWaitingChange = (checked: any) => {
    const postData = {
      method: 'POST',
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
      <div className="lk-participants">
        <h3>Participants</h3>
        {/* <button onClick={muteAllMircophone}>Mute All</button> */}
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

      <div className="lk-waitinroom">
        <div>
          <h3>Waiting Room</h3>
          <div>
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
        </div>
        {waitingRoom.map((item: LocalUserChoices) => (
          <div style={{ position: 'relative' }} key={item.username}>
            <div className="lk-participant-metadata">
              <div className="lk-pa rticipant-metadata-item">{item.username}</div>
              <div>
                <button
                  className="lk-button lk-waiting-room lk-success"
                  onClick={() => admitUser(item.username, 'accepted')}
                >
                  Approve
                </button>
                <button
                  className="lk-button lk-waiting-room lk-danger"
                  onClick={() => admitUser(item.username, 'rejected')}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}