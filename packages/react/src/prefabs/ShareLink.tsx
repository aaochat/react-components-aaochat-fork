import type { ChatMessage, ReceivedChatMessage } from '@livekit/components-core';
import * as React from 'react';
import { useRoomContext } from '../context';

export type { ChatMessage, ReceivedChatMessage };

export function useGetLink() {
  const room = useRoomContext();

  const host = typeof window ? window.location.hostname : '';
  const link = `${host}/join/${room.name}`;

  return { link: link };
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

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (inputRef.current && inputRef.current.value.trim() !== '') {
      // if (send) {
      //   await send(inputRef.current.value);
      //   inputRef.current.value = '';
      //   inputRef.current.focus();
      // }
    }
  }

  React.useEffect(() => {
    if (ulRef) {
      ulRef.current?.scrollTo({ top: ulRef.current.scrollHeight });
    }
  }, [ulRef]);

  return (
    <div {...props} className="lk-chat lk-sharelink">
      <div>
        <h3>{link}</h3>
        <button type="button" className="lk-button lk-chat-form-button">
          Copy
        </button>
      </div>

      <form className="lk-chat-form" onSubmit={handleSubmit}>
        <input
          className="lk-form-control lk-chat-form-input"
          ref={inputRef}
          type="text"
          placeholder="Search User..."
        />
        <button type="submit" className="lk-button lk-chat-form-button">
          Send
        </button>
      </form>
    </div>
  );
}
