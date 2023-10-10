/* eslint-disable prettier/prettier */
import * as React from 'react';
import { useEnsureParticipant, useRoomContext } from '../context';
import { Toast } from '../components';
import { useLocalParticipant } from '../hooks';
import { setupParticipantName } from '@livekit/components-core';
import { useObservableState } from '../hooks/internal';

export function useGetLink() {
  const host = getHostUrl();
  const link = `${host}/meeting/${useGetRoom().name}`;
  return { link: link };
}

export function useGetRoom() {
  const room = useRoomContext();
  return room;
}

export function getHostUrl() {
  return typeof window ? window.location.origin : '';
}

export function getToken() {
  const urlParams = new URLSearchParams(window.location.search);
  return localStorage.getItem('host') ?? urlParams.get('token');
}

export type User = {
  contact_id: string;
  user_id: string;
  full_name: string;
  invited: boolean
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
  const [showToast, setShowToast] = React.useState<boolean>(false);
  // const [ checkedValues, setCheckedValues ] = React.useState<string[]>([]);
  const room = useGetRoom();

  async function searchUsers(key: string) {
    if (key) {
      const filteredData = users.filter(function (item) {
        return (item.full_name.toLocaleLowerCase()).startsWith(key.toLocaleLowerCase());
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
        token: getToken(),
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

  const { localParticipant } = useLocalParticipant();
  const p = useEnsureParticipant(localParticipant);

  const { infoObserver } = React.useMemo(() => {
    return setupParticipantName(p);
  }, [p]);

  const { metadata } = useObservableState(infoObserver, {
    name: p.name,
    identity: p.identity,
    metadata: p.metadata,
  });

  const meta = metadata ? JSON.parse(metadata) : {};
  const [showInviteUser, setShowInviteUser] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (meta && meta.host && meta.limited) {
      setShowInviteUser(false);
    } else {
      setShowInviteUser(true);
    }
  }, [meta]);

  React.useEffect(() => {
    const pmeta = p.metadata ? JSON.parse(p.metadata) : {};
    if (pmeta && pmeta.host && meta.limited) {
      setShowInviteUser(false);
    } else {
      setShowInviteUser(true);
    }
  }, [p]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (inputRef.current && inputRef.current.value.trim() !== '') {
      searchUsers(inputRef.current.value);
    } else {
      setSearched(users);
    }
  }

  async function setInvitedFirst(user: User, valueToSet: boolean = true) {
    user.invited = valueToSet;

    const newUsers = users.map((item) =>
      item.contact_id === user.contact_id ? { ...item, invited: valueToSet } : item
    );
    setUsers(newUsers);

    const newSearched = searched.map((item) =>
      item.contact_id === user.contact_id ? { ...item, invited: valueToSet } : item
    );
    setSearched(newSearched);
  }

  async function handleInvite(user: User) {
    setInvitedFirst(user, true);
    const data = {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "userId": user.contact_id, // body data type must match "Content-Type" header
        "userName": user.full_name, // body data type must match "Content-Type" header
        "message": link,
        "meeting_id": room.name,
        "token": getToken()
      })
    };

    fetch(`/api/invite-user`, data).then(async (res) => {
      if (res.ok) {

      } else {
        setInvitedFirst(user, false);
        throw Error('Error fetching server url, check server logs');
      }
    });
  }

  async function handleCopy() {
    navigator.clipboard.writeText(link);
    setShowToast(true);
  }

  React.useEffect(() => {
    if (showToast) {
      setTimeout(() => {
        setShowToast(false);
      }, 3000)
    }
  }, [showToast]);

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

      {showToast ? <Toast className="lk-toast-connection-state">Copied</Toast> : <></>}

      {showInviteUser ? (
        <form className="lk-chat-form" onSubmit={handleSubmit}>
          <input
            className="lk-form-control lk-chat-form-input"
            ref={inputRef}
            type="text"
            placeholder="Search User..."
            onChange={handleSubmit}
          />
        </form>
      ) : (<></>)}

      {
        showInviteUser && searched.length > 0 ? (
          <ul className="lk-list lk-chat-messages" ref={ulRef}>
            {searched.map((user, index) => {
              return (
                <li key={index} className="lk-chat-entry">
                  <div>
                    <span className="lk-message-body">{user.full_name}</span>
                    <span className="lk-message-body lk-message-text">{user.user_name}</span>
                  </div>

                  <button type="button" onClick={() => handleInvite(user)} className={"lk-button lk-chat-form-button" + (user.invited ? ' invited' : '')}>
                    {user.invited ? 'Invited' : 'Invite'}
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          ''
        )
      }
    </div >
  );
}
