import { libC } from '../src/lib/lib-c';

describe('libC', () => {
  it('should work', () => {
    expect(libC()).toEqual(['lib-a', 'lib-a lib-b', 'lib-c']);
  });
});
