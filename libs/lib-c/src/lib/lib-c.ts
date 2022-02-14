import { S3 } from 'aws-sdk';
import stream from 'highland';

export function libC(s3: S3) {
  return stream(
    s3
      .listBuckets()
      .promise()
      .then((res) => res?.Buckets ?? []),
  )
    .flatten()
    .map((bucket) =>
      stream(
        s3
          .listObjectsV2({
            Bucket: bucket.Name as string,
          })
          .promise()
          .then((o) => ({
            bucket: o.Name as string,
            objects: o.Contents ?? [],
          })),
      ),
    )
    .parallel(5)
    .map((o) => ({
      ...o,
      extraInfo: true,
      param: 'a-param',
    }));
}
