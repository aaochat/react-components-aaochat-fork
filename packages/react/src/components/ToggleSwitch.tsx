import React from 'react';

// Set optionLabels for rendering.
export type ToggleSwitchProps = {
  optionLabels: ['Yes', 'No'];
};

export type ToggleSwitchPropTypes = {
  id: string;
  checked: boolean;
  name: string;
  onChange: (checked: boolean) => void;
  optionLabels: string[];
  small: boolean;
  disabled: boolean;
};

/*
Toggle Switch Component
Note: id, checked and onChange are required for ToggleSwitch component to function. The props name, small, disabled
and optionLabels are optional.
Usage: <ToggleSwitch id="id" checked={value} onChange={checked => setValue(checked)}} />
*/

export const ToggleSwitch = ({
  id,
  name,
  checked,
  onChange,
  optionLabels,
  small,
  disabled,
}: ToggleSwitchPropTypes) => {
  function handleKeyPress(e: React.KeyboardEvent<HTMLLabelElement>) {
    if (e.keyCode !== 32) return;

    e.preventDefault();
    onChange(!checked);
  }

  return (
    <div className={'toggle-switch' + (small ? ' small-switch' : '')}>
      <input
        type="checkbox"
        name={name}
        className="toggle-switch-checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      {id ? (
        <label
          className="toggle-switch-label"
          tabIndex={disabled ? -1 : 1}
          onKeyDown={(e) => handleKeyPress(e)}
          htmlFor={id}
        >
          <span
            className={
              disabled ? 'toggle-switch-inner toggle-switch-disabled' : 'toggle-switch-inner'
            }
            data-yes={optionLabels[0]}
            data-no={optionLabels[1]}
            tabIndex={-1}
          />
          <span
            className={
              disabled ? 'toggle-switch-switch toggle-switch-disabled' : 'toggle-switch-switch'
            }
            tabIndex={-1}
          />
        </label>
      ) : null}
    </div>
  );
};
