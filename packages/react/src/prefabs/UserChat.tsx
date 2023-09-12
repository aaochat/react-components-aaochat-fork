import type { ReceivedChatMessage, ChatMessage } from '@livekit/components-core';
import * as React from 'react';

/** @public */
export type MessageFormatter = (message: string) => React.ReactNode;

/** @public */
export type MessageEncoder = (message: ChatMessage) => Uint8Array;
/** @public */
export type MessageDecoder = (message: Uint8Array) => ReceivedChatMessage;

/**
 * UserChat composes the HTML div element under the hood, so you can pass all its props.
 * These are the props specific to the UserChat component:
 * @public
 */
export interface UserChatProps extends React.HTMLAttributes<HTMLLIElement> {
    /** The chat massage object to display. */
    entry: ReceivedChatMessage;
    /** Hide sender name. Useful when displaying multiple consecutive chat messages from the same person. */
    hideName?: boolean;
    /** Hide message timestamp. */
    hideTimestamp?: boolean;
    /** An optional formatter for the message body. */
    messageFormatter?: MessageFormatter;
}

/**
 * The `UserChat` component holds and displays one chat message.
 *
 * @example
 * ```tsx
 * <Chat>
 *   <UserChat />
 * </Chat>
 * ```
 * @see `Chat`
 * @public
 */
export function UserChat({
    entry,
    hideName = false,
    hideTimestamp = false,
    messageFormatter,
    ...props
}: UserChatProps) {
    const formattedMessage = React.useMemo(() => {
        return messageFormatter ? messageFormatter(entry.message) : entry.message;
    }, [entry.message, messageFormatter]);
    const time = new Date(entry.timestamp);
    const locale = navigator ? navigator.language : 'en-US';

    return (
        <li
            className="tl-chat-entry"
            title={time.toLocaleTimeString(locale, { timeStyle: 'full' })}
            data-lk-message-origin={entry.from?.isLocal ? 'local' : 'remote'}
            {...props}
        >
            <span className="lk-meta-data">
                <strong className="lk-participant-name">
                    {entry.from?.name ?? entry.from?.identity}
                </strong>
            </span>
            <span className="lk-message-body">{formattedMessage}</span>
        </li>
    );
}
