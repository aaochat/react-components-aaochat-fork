import type { WidgetState } from '@livekit/components-core';
import type * as React from 'react';

/** @internal */
export type ChatContextAction =
  | { msg: 'show_chat' }
  | { msg: 'show_invite' }
  | { msg: 'show_users' };

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
    } else if (action.msg === 'show_invite') {
      return { ...state, showChat: 'show_invite' };
    } else if (action.msg === 'show_users') {
      return { ...state, showChat: 'show_users' };
    } else {
      return { ...state, showChat: null };
    }
  } else {
    return { ...state, showChat: null };
  }
}
