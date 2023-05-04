import { prefixClass } from '../styles-interface';

export function setupUserToggle() {
  const className: string = [prefixClass('button')].join(' ');
  return { className };
}
