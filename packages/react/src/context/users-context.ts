import type { WidgetState } from '@livekit/components-core';
import type * as React from 'react';

/** @internal */
export type UserContextAction =
  | { msg: 'show_users' }
  | { msg: 'hide_users' }
  | { msg: 'toggle_users' };

/** @internal */
export type UserContextType = {
  dispatch?: React.Dispatch<UserContextAction>;
  state?: WidgetState;
};

/** @internal */
export function userReducer(state: WidgetState, action: UserContextAction): WidgetState {
  if (action.msg === 'show_users') {
    return { ...state, showUser: true };
  } else if (action.msg === 'hide_users') {
    return { ...state, showUser: false };
  } else if (action.msg === 'toggle_users') {
    return { ...state, showUser: !state.showUser };
  } else {
    return { ...state };
  }
}
