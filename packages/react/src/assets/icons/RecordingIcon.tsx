import * as React from 'react';
import type { SVGProps } from 'react';

interface RecordingIconProps extends SVGProps<SVGSVGElement> {
  color?: string;
}

const SvgRecordingIcon = ({ color = 'white', ...props }: RecordingIconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16" {...props}>
    <circle cx="8" cy="8" r="6" fill={color} />
  </svg>
);

export default SvgRecordingIcon;
