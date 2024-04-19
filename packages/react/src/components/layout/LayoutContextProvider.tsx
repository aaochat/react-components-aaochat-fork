import type { PinState, WidgetState } from '@livekit/components-core';
import { log } from '@livekit/components-core';
import * as React from 'react';
import type { LayoutContextType } from '../../context';
import { LayoutContext, useEnsureCreateLayoutContext } from '../../context';
import { WhiteboardState } from '../../context/whiteboard-context';

/** @alpha */
export interface LayoutContextProviderProps {
  value?: LayoutContextType;
  onPinChange?: (state: PinState) => void;
  onWidgetChange?: (state: WidgetState) => void;
  onWhiteboardChange?: (state: WhiteboardState) => void;
}

/** @alpha */
export function LayoutContextProvider({
  value,
  onPinChange,
  onWidgetChange,
  onWhiteboardChange,
  children,
}: React.PropsWithChildren<LayoutContextProviderProps>) {
  const layoutContextValue = useEnsureCreateLayoutContext(value);

  React.useEffect(() => {
    log.debug('PinState Updated', { state: layoutContextValue.pin.state });
    if (onPinChange && layoutContextValue.pin.state) onPinChange(layoutContextValue.pin.state);
  }, [layoutContextValue.pin.state, onPinChange]);

  React.useEffect(() => {
    log.debug('Chat Widget Updated', { widgetState: layoutContextValue.widget.state });
    if (onWidgetChange && layoutContextValue.widget.state) {
      onWidgetChange(layoutContextValue.widget.state);
    }
  }, [onWidgetChange, layoutContextValue.widget.state]);

  React.useEffect(() => {
    log.debug('Whiteboard Updated', { state: layoutContextValue.whiteboard.state });
    if (onWhiteboardChange && layoutContextValue.whiteboard.state) {
      onWhiteboardChange(layoutContextValue.whiteboard.state);
    }
  }, [layoutContextValue.whiteboard.state]);

  return <LayoutContext.Provider value={layoutContextValue}>{children}</LayoutContext.Provider>;
}
