/* eslint-disable prettier/prettier */
import * as React from 'react';
import { useRoomContext } from '../context';

export function useGetLink() {
  const room = useRoomContext();

  const host = getHostUrl();
  const link = `${host}/join/${room.name}`;

  return { link: link };
}

export function getHostUrl() {
  return typeof window ? window.location.origin : '';
}
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
  const [ users, setUsers ] = React.useState<string[]>([]);
  const [checkedValues, setCheckedValues] = React.useState<string[]>([]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (inputRef.current && inputRef.current.value.trim() !== '') {
      fetch(`${getHostUrl()}/api/get-users/${inputRef.current.value}`).then(async (res) => {
        if (res.ok) {
          const body = await res.json();
          setUsers(body);
        } else {
          throw Error('Error fetching server url, check server logs');
        }
      });
    }
  }

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setCheckedValues([...checkedValues, event.target.value]);
    } else {
      setCheckedValues(checkedValues.filter((value: string) => value !== event.target.value));
    }
  };

  async function handleSend() {
    const data = {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      body: JSON.stringify({
         "users": checkedValues , // body data type must match "Content-Type" header
         "joinLink": link 
    })
    };

    fetch(`${getHostUrl()}/api/invite-users`, data).then(async (res) => {
        if (res.ok) {
          const body = await res.json();
          setUsers(body);
        } else {
          throw Error('Error fetching server url, check server logs');
        }
      });
  }
  

  async function handleCopy() {
    navigator.clipboard.writeText(link);
  }

  React.useEffect(() => {
    console.log(users);
    
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
        <button type="submit" onClick={handleSend} className="lk-button lk-chat-form-button">
          Send
        </button>
      </form>

      <ul className="lk-list lk-chat-messages" ref={ulRef}>
        {users.map((user, index) => {
          return (
            <li key={index} className="lk-chat-entry">
              <input
                type="checkbox"
                name="selectedUser"
                id='selectedUser'
                value={user}
                checked={checkedValues.includes(user)}
                onChange={handleCheckboxChange}
              />
              <span className="lk-message-body">{user}</span>
            </li>
          )
        })}
      </ul>
    </div>
  );
}
