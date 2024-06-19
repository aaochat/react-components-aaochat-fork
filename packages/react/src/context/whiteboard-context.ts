import type * as React from 'react';

export type WhiteboardState = {
    show_whiteboard: boolean;
};

export const WHITEBOARD_DEFAULT_STATE: WhiteboardState = { show_whiteboard: false };

/** @internal */
export type WhiteboardContextAction =
    | { msg: 'show_whiteboard' }
    | { msg: 'hide_whiteboard' };

/** @internal */
export type WhiteboardContextType = {
  dispatch?: React.Dispatch<WhiteboardContextAction>;
  state?: WhiteboardState;
};

/** @internal */
export function whiteboardReducer(state: WhiteboardState, action: WhiteboardContextAction): WhiteboardState {
    if (action.msg && action.msg == 'show_whiteboard') {
        return { ...state, show_whiteboard: true };
    }
    else {
        return { ...state, show_whiteboard: false };
    }   
}
