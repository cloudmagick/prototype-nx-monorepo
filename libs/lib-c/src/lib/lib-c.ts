import { libA } from '@cloud-magix/lib-a';
import { libB } from '@cloud-magix/lib-b';

export function libC(): string[] {
  return [libA(), libB(), 'lib-c'];
}
