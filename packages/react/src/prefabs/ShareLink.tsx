import * as React from 'react';
import { useRoomContext } from '../context';

export function useGetLink() {
  const room = useRoomContext();

  const host = typeof window ? window.location.origin : '';
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

  async function handleCopy() {
    navigator.clipboard.writeText(link);
  }

  React.useEffect(() => {
    if (ulRef) {
      ulRef.current?.scrollTo({ top: ulRef.current.scrollHeight });
    }
  }, [ulRef]);

  return (
    <div {...props} className="lk-chat lk-sharelink">
      <form className="lk-chat-form" onSubmit={handleSubmit}>
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
        />
        <button type="submit" className="lk-button lk-chat-form-button">
          Send
        </button>
      </form>
    </div>
  );
}
