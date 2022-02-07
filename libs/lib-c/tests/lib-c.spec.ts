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
      listObjectsV2: awsPromisify((b) =>
        Promise.resolve({
          Name: 'bucket-1',
          Contents: [
            {
              Key: 'key-1',
            },
          ],
        } as S3.ListObjectsV2Output),
      ),
    };
    const results = await libC(s3 as S3)
      .collect()
      .toPromise(Promise);
    console.log(results);
    expect(results).toEqual([
      {
        bucket: 'bucket-1',
        objects: [
          {
            Key: 'key-1',
          },
        ],
        extraInfo: true,
        param: 'a-param',
      },
    ]);
  });
});
