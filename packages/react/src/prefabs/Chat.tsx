import type { ChatMessage, ChatOptions } from '@livekit/components-core';
import * as React from 'react';
import { useMaybeLayoutContext } from '../context';
import { cloneSingleChild } from '../utils';
import type { MessageFormatter } from '../components/ChatEntry';
import { useChat } from '../hooks/useChat';
import { MessageDecoder, MessageEncoder, UserChat } from './UserChat';
import SvgSendMessage from './../assets/icons/tl/SendMessage';
// import { ChatToggle } from '../components';
// import { ChatCloseIcon } from '../assets/icons';

/** @public */
export interface ChatProps extends React.HTMLAttributes<HTMLDivElement>, ChatOptions {
  messageFormatter?: MessageFormatter;
  messageEncoder?: MessageEncoder;
  messageDecoder?: MessageDecoder;
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
export function Chat({ messageFormatter, messageDecoder, messageEncoder, channelTopic, ...props }: ChatProps) {
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const chatForm = React.useRef<HTMLFormElement>(null);
  const ulRef = React.useRef<HTMLUListElement>(null);

  const chatOptions: ChatOptions = React.useMemo(() => {
    return { messageDecoder, messageEncoder, channelTopic };
  }, [messageDecoder, messageEncoder, channelTopic]);

  const { send, chatMessages, isSending } = useChat(chatOptions);

  const layoutContext = useMaybeLayoutContext();
  const lastReadMsgAt = React.useRef<ChatMessage['timestamp']>(0);

  async function handleSubmit(event: any) {
    event.preventDefault();

    if (inputRef.current && inputRef.current.value.trim() !== '') {
      if (send) {
        await send(inputRef.current.value);
        inputRef.current.value = '';
        inputRef.current.focus();
      }
    }
  }

  async function onEnterPress(e: React.KeyboardEvent) {
    if (e.code == 'Enter' && e.shiftKey == false) {
      e.stopPropagation();

      await handleSubmit(e);
    }
  }

  React.useEffect(() => {
    if (ulRef) {
      ulRef.current?.scrollTo({ top: ulRef.current.scrollHeight });
    }
  }, [ulRef, chatMessages]);

  React.useEffect(() => {
    if (!layoutContext || chatMessages.length === 0) {
      return;
    }

    if (
      layoutContext.widget.state?.showChat == 'show_chat' &&
      chatMessages.length > 0 &&
      // lastReadMsgAt.current !== chatMessages[chatMessages.length - 1]?.timestamp
      lastReadMsgAt.current < chatMessages.length
    ) {
      // lastReadMsgAt.current = chatMessages[chatMessages.length - 1]?.timestamp;
      lastReadMsgAt.current = chatMessages.length;
      return;
    }

    const unreadMessageCount = chatMessages.length - lastReadMsgAt.current;
    // const unreadMessageCount = chatMessages.filter(
    //   (msg) => !lastReadMsgAt.current || msg.timestamp > lastReadMsgAt.current,
    // ).length;

    const { widget } = layoutContext;
    if (unreadMessageCount > 0 && widget.state?.unreadMessages !== unreadMessageCount) {
      widget.dispatch?.({ msg: 'unread_msg', count: unreadMessageCount });
    }
  }, [chatMessages, layoutContext?.widget]);

  return (
    <div {...props} className="lk-chat tl-chat">
      {/* <div className="lk-chat-header tl-chat-header">
        <ChatToggle className="lk-close-button">
          <ChatCloseIcon />
        </ChatToggle>
      </div> */}
      <ul className="tl-list lk-chat-messages" ref={ulRef}>
        {props.children
          ? chatMessages.map((msg, idx) =>
            cloneSingleChild(props.children, {
              entry: msg,
              key: idx,
              messageFormatter,
            }),
          )
          : chatMessages.map((msg, idx, allMsg) => {
            const hideName = idx >= 1 && allMsg[idx - 1].from === msg.from;
            // If the time delta between two messages is bigger than 60s show timestamp.
            const hideTimestamp = idx >= 1 && msg.timestamp - allMsg[idx - 1].timestamp < 60_000;

            return (
              <UserChat
                key={idx}
                hideName={hideName}
                hideTimestamp={hideName === false ? false : hideTimestamp} // If we show the name always show the timestamp as well.
                entry={msg}
                messageFormatter={messageFormatter}
              />
            );
          })}
        {/* return (
                <ChatEntry
          key={msg.id ?? idx}
          hideName={hideName}
          hideTimestamp={hideName === false ? false : hideTimestamp} // If we show the name always show the timestamp as well.
          entry={msg}
          messageFormatter={messageFormatter}
        />
        ); 
              })} */}
      </ul>
      <form className="lk-chat-form" ref={chatForm} onSubmit={handleSubmit}>
        <textarea
          className="lk-form-control lk-chat-form-input overflow-hidden"
          // disabled={isSending}
          ref={inputRef}
          onKeyDown={onEnterPress}
          rows={1}
          placeholder="Enter a message..."
          onInput={(ev) => ev.stopPropagation()}
          onKeyUp={(ev) => ev.stopPropagation()}
        ></textarea>
        <button type="submit" className="lk-button lk-chat-form-button tl-submit" disabled={isSending}>
          <SvgSendMessage />
        </button>
      </form >
    </div >
  );
}
