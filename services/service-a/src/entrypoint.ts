import { Context } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import h from 'highland';
import _ from 'lodash';
import { serviceA } from './service/service-a';

const s3 = new S3();
export async function handler(event: unknown, context: Context) {
  console.log('Lambda Invoked Successfully!');
  console.log('Lambda Event', event);
  console.log('Lambda Context', context);
  console.log('Test');
  h([1, 2, 3]).each((x) => {
    console.log(x);
  });
  _([4, 5, 6]).forEach((x) => {
    console.log(x);
  });
  return serviceA(s3)
    .tap((bucket) => {
      console.log('Name: ', bucket.Name);
      console.log('CreatedAt: ', bucket.CreationDate);
      console.log('Extra Info: ', bucket.extraInfo);
      throw new Error('An error occurred');
    })
    .collect()
    .errors((err) => {
      console.error(err.message);
    })
    .toPromise(Promise);
}
