import type { WidgetState } from '@livekit/components-core';
import type * as React from 'react';

/** @internal */
export type ShareLinkContextAction =
  | { msg: 'show_sharelink' }
  | { msg: 'hide_sharelink' }
  | { msg: 'toggle_sharelink' };


/** @internal */
export type ShareLinkContextType = {
  dispatch?: React.Dispatch<ShareLinkContextAction>;
  state?: WidgetState;
};

/** @internal */
export function shareLinkReducer(state: WidgetState, action: ShareLinkContextAction): WidgetState {
  if (action.msg === 'show_sharelink') {
    return { ...state, showShareLink: true };
  } else if (action.msg === 'hide_sharelink') {
    return { ...state, showShareLink: false };
  } else if (action.msg === 'toggle_sharelink') {
    return { ...state, showShareLink: !state.showShareLink };
  } else {
    return { ...state };
  }
}
