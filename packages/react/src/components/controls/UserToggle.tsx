import * as React from 'react';
import { useLayoutContext } from '../../context';
import { mergeProps } from '../../utils';
import { setupUserToggle } from '@livekit/components-core';

interface UseToggleUserProps {
  props: React.ButtonHTMLAttributes<HTMLButtonElement>;
}

function useToggleUserLink({ props }: UseToggleUserProps) {
  const { dispatch, state } = useLayoutContext().widget;
  const { className } = React.useMemo(() => setupUserToggle(), []);

  const mergedProps = React.useMemo(
    () =>
      mergeProps(props, {
        className,
        onClick: () => {
          if (dispatch) dispatch({ msg: 'show_users' });
        },
        'aria-pressed': state?.showChat == 'show_users' ? 'true' : 'false',
      }),
    [props, className, dispatch],
  );

  return { mergedProps };
}

/** @public */
export type UserToggleProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

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
export function UserToggle(props: UserToggleProps) {
  const { mergedProps } = useToggleUserLink({ props });

  return <button {...mergedProps}>{props.children}</button>;
}
