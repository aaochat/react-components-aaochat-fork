import { computeMenuPosition, wasClickOutside } from '@livekit/components-core';
import * as React from 'react';
import { BlurIndicater } from './BlurIndicater';
import { Track } from 'livekit-client';
import { WhiteboardIndicater } from './WhiteboardIndicater';

/** @public */
export interface ExtraOptionMenuProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  blurEnabled?: boolean;
  whiteBoard?: boolean;
}

/**
 * The HostEndMeetingMenu prefab component is a button that opens a menu lists that use to leave or end meeting for host
 *
 * @example
 * ```tsx
 * <LiveKitRoom>
 *   <HostEndMeetingMenu />
 * </LiveKitRoom>
 * ```
 * @public
 */
export function ExtraOptionMenu({
  blurEnabled,
  whiteBoard,
  ...props
}: ExtraOptionMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [updateRequired, setUpdateRequired] = React.useState<boolean>(true);

  const button = React.useRef<HTMLButtonElement>(null);
  const blurButtonRef = React.useRef<HTMLButtonElement>(null);
  const tooltip = React.useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = React.useState(false);

  React.useLayoutEffect(() => {
    if (button.current && tooltip.current && updateRequired) {
      computeMenuPosition(button.current, tooltip.current).then(({ x, y }) => {
        if (tooltip.current) {
          Object.assign(tooltip.current.style, { left: `${x}px`, top: `${y + 5}px` });
        }
      });
      setUpdateRequired(false);
    }
  }, [button, tooltip, updateRequired]);

  const handleClickOutside = React.useCallback(
    (event: MouseEvent) => {
      if (!tooltip.current) {
        return;
      }

      if (event.target === blurButtonRef.current) {
        return;
      }

      if (event.target === button.current) {
        return;
      }


      if (isOpen && wasClickOutside(tooltip.current, event)) {
        setIsOpen(false);
        setShowDropdown(false);
      }
    },
    [isOpen, tooltip, button],
  );

  function changeState() {
    setIsOpen(false);
    setShowDropdown(false);
  }

  React.useEffect(() => {
    document.addEventListener<'click'>('click', handleClickOutside);
    window.addEventListener<'resize'>('resize', () => setUpdateRequired(true));
    return () => {
      document.removeEventListener<'click'>('click', handleClickOutside);
      window.removeEventListener<'resize'>('resize', () => setUpdateRequired(true));
    };
  }, [handleClickOutside]);

  return (
    <>
      <button className="lk-button tl-extra-menu" aria-pressed={isOpen}
        {...props}
        onClick={() => setIsOpen(!isOpen)}
        ref={button}>
      </button>
      {/** only render when enabled in order to make sure that the permissions are requested only if the menu is enabled */}
      <div
        className="lk-device-menu tl-extra-menu-list"
        ref={tooltip}
        style={{ visibility: isOpen ? 'visible' : 'hidden' }}
      >
        <ul className="lk-media-device-select lk-list" style={{ display: !showDropdown ? 'unset' : 'none' }}>
          <li>
            <WhiteboardIndicater isWhiteboard={whiteBoard} parentCallback={changeState} />
          </li>
          {blurEnabled && (
            <li>
              <BlurIndicater source={Track.Source.Camera} parentCallback={changeState} />
            </li>
          )}
        </ul>

        <div className="arrow">
          <div className="arrow-shape"></div>
        </div>
      </div >
    </>
  );
}
