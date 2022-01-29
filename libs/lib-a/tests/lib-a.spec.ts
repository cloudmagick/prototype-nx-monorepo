import { libA } from '../src/lib/lib-a';

describe('libA', () => {
  it('should work', () => {
    expect(libA()).toEqual('lib-a');
  });
});
