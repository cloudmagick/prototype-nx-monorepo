import { serviceA } from '../src/service/service-a';

describe('serviceA', () => {
  it('should work', () => {
    expect(serviceA()).toEqual(`service-a lib-a,lib-a lib-b,lib-c`);
  });
});
