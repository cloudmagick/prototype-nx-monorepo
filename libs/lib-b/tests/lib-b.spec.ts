import { libB } from '../src/lib/lib-b';

describe('libB', () => {
  it('should work', () => {
    expect(libB()).toEqual('lib-a lib-b');
  });
});
