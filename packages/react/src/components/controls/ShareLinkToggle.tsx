import { setupShareLinkToggle } from '@livekit/components-core';
import { useLayoutContext } from '../../context';
import { mergeProps } from '../../utils';
import * as React from 'react';

interface UseToggleShareLinkProps {
  props: React.ButtonHTMLAttributes<HTMLButtonElement>;
}

function useToggleShareLink({ props }: UseToggleShareLinkProps) {
  const { dispatch, state } = useLayoutContext().widget;
  const { className } = React.useMemo(() => setupShareLinkToggle(), []);

  const mergedProps = React.useMemo(
    () =>
      mergeProps(props, {
        className,
        onClick: () => {
          if (dispatch) dispatch({ msg: 'show_invite' });
        },
        'aria-pressed': state?.showChat == 'show_invite' ? 'true' : 'false',
      }),
    [props, className, dispatch],
  );

  return { mergedProps };
}

/** @public */
export type ShareLinkToggleProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * The ShareLinkToggle component toggles the visibility of the chat component.
 *
 * @example
 * ```tsx
 * <LiveKitRoom>
 *   <ToggleShareLink />
 * </LiveKitRoom>
 * ```
 * @public
 */
export function ShareLinkToggle(props: ShareLinkToggleProps) {
  const { mergedProps } = useToggleShareLink({ props });

  return <button {...mergedProps}>{props.children}</button>;
}
