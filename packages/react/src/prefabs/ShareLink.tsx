import * as React from 'react';
import { useEnsureParticipant, useRoomContext } from '../context';
import { Toast } from '../components';
import { useLocalParticipant } from '../hooks';
import { setupParticipantName } from '@livekit/components-core';
import { useObservableState } from '../hooks/internal';
import { InviteViaPhone } from './InviteViaPhone';
import { InviteViaEmail } from './InviteViaEmail';
import { useToast } from '../hooks/useToast';

export function useGetLink() {
  const host = getHostUrl();
  const link = `${host}/${getDomainIdentifier()}/meeting/${useGetRoom().name}`;
  return { link: link };
}

export function useGetRoom() {
  const room = useRoomContext();
  return room;
}

export function getHostUrl() {
  return typeof window ? window.location.origin : '';
}

export function getDomainIdentifier() {
  return typeof window ? ((window.location.href).split("/"))[3] : '';
}

export function getToken() {
  const urlParams = new URLSearchParams(window.location.search);
  return localStorage.getItem('host') ?? urlParams.get('token');
}

export type User = {
  user_id: string;
  user_name: string;
  designation: string;
  full_name: string;
  invited: boolean
};

export interface ShareLinkProps extends React.HTMLAttributes<HTMLDivElement> {
  isCallScreen: boolean;
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
export function ShareLink({ isCallScreen, ...props }: ShareLinkProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const ulRef = React.useRef<HTMLUListElement>(null);
  const { link } = useGetLink();
  const [users, setUsers] = React.useState<User[]>([]);
  const [searched, setSearched] = React.useState<User[]>([]);
  const { showToast, setShowToast } = useToast();
  const [inviteVia, setInviteVia] = React.useState<string>('chat');
  const [invitedUsers, setInvitedUsers] =
    React.useState<string[]>([]);
  function showInviteVia(type: string) {
    setInviteVia(type);
  }

  // const [ checkedValues, setCheckedValues ] = React.useState<string[]>([]);
  const room = useGetRoom();
  const participantName = room.localParticipant.name;
  async function searchUsers(key: string) {
    if (key) {
      const filteredData = users.filter(function (item) {
        return (item.full_name.toLocaleLowerCase()).includes(key.trim().toLocaleLowerCase());
      });
      setSearched(filteredData)
    } else {
      setSearched(users)
    }
  }

  const queryParams = new URLSearchParams(window.location.search);
  const token = queryParams.get("token");
  const authKey = queryParams.get("authKey");
  let postRequest: any = {
    meeting_id: room.name,
    token: getToken(),
    authKey: null,
    domain: getDomainIdentifier(),
  };
  if (token && authKey) {
    postRequest.token = token;
    postRequest.authKey = authKey;
  }

  async function getUsers() {
    const data = {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postRequest)
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
    } else {
      setSearched(users);
    }
  }

  async function handleInvite(user: User) {
    setInvitedUsers((prevUser) => [...prevUser, user.user_id]);
    let data = {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json'
      },
      body: ""
    };

    if (isCallScreen) {
      data.body = JSON.stringify({
        "invite_user_id": user.user_id,
        "meeting_id": room.name,
        "authKey": authKey,
      })
    } else {
      data.body = JSON.stringify({
        "userId": user.user_id, // body data type must match "Content-Type" header
        "userName": user.full_name, // body data type must match "Content-Type" header
        "message": link,
        "meeting_id": room.name,
        "token": getToken(),
        "domain": getDomainIdentifier()
      })
    }

    fetch(`/api/invite-user`, data).then(async (res) => {
      if (res.ok) {
        // setInvitedFirst(user, false);
      } else {
        throw Error('Error fetching server url, check server logs');
      }
    });
  }

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
  const [showInviteUser, setShowInviteUser] = React.useState<boolean>(true);
  React.useEffect(() => {
    if (meta && meta.host && meta.limited) {
      setShowInviteUser(false);
    }
  }, [meta]);

  React.useEffect(() => {
    const pmeta = p.metadata ? JSON.parse(p.metadata) : {};
    if (pmeta && pmeta.host && meta.limited) {
      setShowInviteUser(false);
    }
  }, [p]);

  // async function setInvitedFirst(user: User, valueToSet: boolean = true) {
  //   user.invited = valueToSet;

  //   const newUsers = users.map((item) =>
  //     item.user_id === user.user_id ? { ...item, invited: valueToSet } : item
  //   );
  //   setUsers(newUsers);

  //   const newSearched = searched.map((item) =>
  //     item.user_id === user.user_id ? { ...item, invited: valueToSet } : item
  //   );
  //   setSearched(newSearched);
  // }

  async function handleCopy() {
    navigator.clipboard.writeText(link);
    setShowToast(true);
  }

  React.useEffect(() => {
    if (ulRef) {
      ulRef.current?.scrollTo({ top: ulRef.current.scrollHeight });
    }
  }, [ulRef, users]);

  React.useEffect(() => {
    setSearched(users);
  }, [inviteVia])

  return (
    <div {...props} className="lk-chat lk-sharelink">
      {!isCallScreen ?
        (
          <form className="lk-chat-form">
            <input className="lk-form-control lk-chat-form-input" type="text" value={link} readOnly />
            <button type="button" className="lk-button lk-chat-form-button" onClick={handleCopy}>
              Copy
            </button>
          </form>
        ) : <></>}

      {showToast ? <Toast className="lk-toast-connection-state">Copied</Toast> : <></>}

      <div className="tl-invite-buttons">
        <button type="button" className="lk-button lk-chat-form-button" aria-pressed={inviteVia === 'chat'} onClick={() => showInviteVia('chat')}>
          Contact
        </button>
        <button type="button" className="lk-button lk-chat-form-button" aria-pressed={inviteVia === 'phone'} onClick={() => showInviteVia('phone')}>
          Phone
        </button>
        <button type="button" className="lk-button lk-chat-form-button" aria-pressed={inviteVia === 'email'} onClick={() => showInviteVia('email')}>
          Email
        </button>
      </div>

      <InviteViaPhone link={link} room_name={room.name} participant={participantName} isCallScreen={isCallScreen} style={{ "display": inviteVia === 'phone' ? "block" : "none" }} />

      <InviteViaEmail link={link} room_name={room.name} participant={participantName} isCallScreen={isCallScreen} style={{ "display": inviteVia === 'email' ? "block" : "none" }} />

      {inviteVia === 'chat' ?
        <>
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

          {showInviteUser && searched.length > 0 ? (
            <ul style={{ height: "70vh", display: "block" }} className="lk-list lk-chat-messages" ref={ulRef}>
              {searched.map((user) => {
                return (
                  <li key={user.user_id} className="lk-chat-entry">
                    <div style={{ width: "100%" }}>
                      <span className="lk-message-body">{user.full_name}</span>
                      <span className="lk-message-body lk-message-text">{user.designation ? user.designation : '-'}</span>
                    </div>

                    <button type="button" onClick={() => handleInvite(user)} className={"lk-button lk-chat-form-button" + (invitedUsers.includes(user.user_id) ? ' invited' : '')}>
                      {invitedUsers.includes(user.user_id) ? "Invited" : "Invite"}
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            ''
          )}
        </>
        :
        <></>
      }
    </div>
  );
}
