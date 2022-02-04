import { S3 } from 'aws-sdk';
import { libA } from '@cloudmagick/lib-a';
import { libB } from '@cloudmagick/lib-b';
import h from 'highland';

export function libC() {
  console.log([libA(), libB()]);
  const s3 = new S3();
  return h(
    s3
      .listBuckets()
      .promise()
      .then((res) => res?.Buckets ?? []),
  )
    .flatten()
    .map((b) => ({
      ...b,
      extraInfo: true,
      param: 'a-param',
    }));
}
