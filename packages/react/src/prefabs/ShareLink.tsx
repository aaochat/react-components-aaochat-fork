/* eslint-disable prettier/prettier */
import * as React from 'react';
import { useRoomContext } from '../context';

export function useGetLink() {
  const host = getHostUrl();
  const link = `${host}/join/${useGetRoom().name}`;

  return { link: link };
}

export function useGetRoom() {
  const room = useRoomContext();
  return room;
}

export function getHostUrl() {
  return typeof window ? window.location.origin : '';
}

export type User = {
  user_id: string;
  user_name: string;
  full_name: string;
  designation: string;
  ext_no: string;
};

/**
 * The Chat component adds a basis chat functionality to the LiveKit room. The messages are distributed to all participants
 * in the room. Only users who are in the room at the time of dispatch will receive the message.
 *
 * @example
 * ```tsx
 * <LiveKitRoom>
 *   <Chat />
 * </LiveKitRoom>
 * ```
 * @public
 */
export function ShareLink({ ...props }: any) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const ulRef = React.useRef<HTMLUListElement>(null);
  const { link } = useGetLink();
  const [users, setUsers] = React.useState<User[]>([]);
  const [searched, setSearched] = React.useState<User[]>([]);
  // const [ checkedValues, setCheckedValues ] = React.useState<string[]>([]);
  const room = useGetRoom();
  async function searchUsers(key: string) {
    if (key) {
      const filteredData = users.filter(function (item) {
        return (item.user_name).startsWith(key);
      });
      setSearched(filteredData)
    } else {
      setSearched(users)
    }
  }

  async function getUsers() {
    const data = {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        meeting_id: room.name,
      })
    };
    fetch(`${getHostUrl()}/api/get-users`, data).then(async (res) => {
      if (res.ok) {
        const body = await res.json();
        setUsers(body);
        setSearched(body);
      } else {
        throw Error('Error fetching server url, check server logs');
      }
    });
  }

  React.useEffect(() => {
    if (room.name) {
      getUsers();
    }
  }, [room.name]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (inputRef.current && inputRef.current.value.trim() !== '') {
      searchUsers(inputRef.current.value);
    }
  }

  // const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   if (event.target.checked) {
  //     setCheckedValues([...checkedValues, event.target.value]);
  //   } else {
  //     setCheckedValues(checkedValues.filter((value: string) => value !== event.target.value));
  //   }
  // };

  // async function handleSend() {
  //   const data = {
  //     method: "POST", // *GET, POST, PUT, DELETE, etc.
  //     body: JSON.stringify({
  //        "users": checkedValues , // body data type must match "Content-Type" header
  //        "joinLink": link 
  //   })
  //   };

  //   fetch(`${getHostUrl()}/api/invite-users`, data).then(async (res) => {
  //       if (res.ok) {
  //         const body = await res.json();
  //         setUsers(body);
  //       } else {
  //         throw Error('Error fetching server url, check server logs');
  //       }
  //     });
  // }

  async function handleInvite(user: User) {
    const data = {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "users": JSON.stringify([user]), // body data type must match "Content-Type" header
        "message": link,
        "meeting_id": room.name,
      })
    };

    fetch(`/api/invite-user`, data).then(async (res) => {
      if (res.ok) {
        const body = await res.json();
        console.log(body);

      } else {
        throw Error('Error fetching server url, check server logs');
      }
    });
  }

  async function handleCopy() {
    navigator.clipboard.writeText(link);
  }

  React.useEffect(() => {
    if (ulRef) {
      ulRef.current?.scrollTo({ top: ulRef.current.scrollHeight });
    }
  }, [ulRef, users]);

  return (
    <div {...props} className="lk-chat lk-sharelink">
      <form className="lk-chat-form">
        <input className="lk-form-control lk-chat-form-input" type="text" value={link} readOnly />
        <button type="button" className="lk-button lk-chat-form-button" onClick={handleCopy}>
          Copy
        </button>
      </form>

      <form className="lk-chat-form" onSubmit={handleSubmit}>
        <input
          className="lk-form-control lk-chat-form-input"
          ref={inputRef}
          type="text"
          placeholder="Search User..."
          onKeyUp={handleSubmit}
        />
        <button type="submit" onClick={handleSubmit} className="lk-button lk-chat-form-button">
          Send
        </button>
      </form>

      <ul className="lk-list lk-chat-messages" ref={ulRef}>
        {searched.map((user, index) => {
          return (
            <li key={index} className="lk-chat-entry">
              <div>
                <span className="lk-message-body">{user.full_name} {user.ext_no ? ` - ${user.ext_no}` : ''}</span>
                <span className="lk-message-body">{user.designation}</span>
              </div>

              <button type="button" onClick={() => handleInvite(user)} className="lk-button lk-chat-form-button">
                Invite
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  );
}
