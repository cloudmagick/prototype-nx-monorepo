import { S3 } from 'aws-sdk';
import { libC } from '../src/lib/lib-c';

const awsPromisify = (
  promiseFn: (...args: unknown[]) => Promise<unknown>,
): any => {
  return () => ({
    promise: () => promiseFn(),
  });
};

describe('libC', () => {
  it('should work', async () => {
    const s3: Partial<S3> = {
      listBuckets: awsPromisify(() =>
        Promise.resolve({
          Buckets: [
            {
              Name: 'bucket-1',
              CreationDate: new Date(2022, 1),
            },
          ],
        }),
      ),
    };
    const results = await libC(s3 as S3)
      .collect()
      .toPromise(Promise);
    expect(results).toEqual([
      {
        Name: 'bucket-1',
        CreationDate: new Date(2022, 1),
        extraInfo: true,
        param: 'a-param',
      },
    ]);
  });
});
