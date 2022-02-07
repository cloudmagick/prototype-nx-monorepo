import { libA } from '@cloudmagick/lib-a';
import { libB } from '@cloudmagick/lib-b';
import { S3 } from 'aws-sdk';
import h from 'highland';

export function libC(s3: S3) {
  console.log([libA(), libB()]);
  return h(
    s3
      .listBuckets()
      .promise()
      .then((res) => res?.Buckets ?? []),
  )
    .flatten()
    .map((bucket) =>
      h(
        s3
          .listObjectsV2({
            Bucket: bucket.Name as string,
          })
          .promise()
          .then((o) => ({ bucket: o.Name, objects: o.Contents ?? [] })),
      ),
    )
    .flatten()
    .map((o) => ({
      ...o,
      extraInfo: true,
      param: 'a-param',
    }));
}
