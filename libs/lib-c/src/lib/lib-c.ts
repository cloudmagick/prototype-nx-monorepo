import { libA } from '@cloudmagick/lib-a';
import { libB } from '@cloudmagick/lib-b';

export function libC(): string[] {
  return [libA(), libB(), 'lib-c'];
}
