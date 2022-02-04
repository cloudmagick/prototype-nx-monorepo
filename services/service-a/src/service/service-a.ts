import { libC } from '@cloudmagick/lib-c';
import { S3 } from 'aws-sdk';

export function serviceA(s3: S3) {
  return libC(s3);
}
