import type { WidgetState } from '@livekit/components-core';
import type * as React from 'react';

/** @internal */
export type ChatContextAction =
  | { msg: 'show_chat' }
  | { msg: 'show_invite' }
  | { msg: 'show_users' }
  | { msg: 'hide_chat' }
  | { msg: 'toggle_chat' }
  | { msg: 'unread_msg'; count: number };

/** @internal */
export type ChatContextType = {
  dispatch?: React.Dispatch<ChatContextAction>;
  state?: WidgetState;
};

/** @internal */
export function chatReducer(state: WidgetState, action: ChatContextAction): WidgetState {
  if (action.msg && action.msg !== state.showChat) {
    if (action.msg === 'show_chat') {
      return { ...state, showChat: 'show_chat' };
    } else if (action.msg === 'toggle_chat') {
      const newState = { ...state, showChat: state.showChat == 'show_chat' ? null : 'show_chat' };
      if (newState.showChat === 'show_chat') {
        newState.unreadMessages = 0;
      }
      return newState;
    }  else if (action.msg === 'show_invite') {
      return { ...state, showChat: 'show_invite' };
    } else if (action.msg === 'show_users') {
      return { ...state, showChat: 'show_users' };
    } else if (action.msg === 'unread_msg') {
      return { ...state, unreadMessages: action.count };
    } else if (action.msg === 'hide_chat') {
      return { ...state, showChat: null };
    } else {
      return { ...state, showChat: null };
    }
  } else {
    return { ...state, showChat: null };
  }
}
