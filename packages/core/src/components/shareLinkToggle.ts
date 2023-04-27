import { prefixClass } from '../styles-interface';

export function setupShareLinkToggle() {
  const className: string = [prefixClass('button')].join(' ');
  return { className };
}
