import { fromPoliciesV2, fromStacks } from '@cloudmagick/lib-b';
import { Context } from 'aws-lambda';
import { CloudFormation, IAM, S3 } from 'aws-sdk';
import h from 'highland';
import { serviceA } from './service/service-a';

const s3 = new S3();
const cfn = new CloudFormation();
const iam = new IAM();
export async function handler(event: unknown, context: Context) {
  console.log('Lambda Invoked Successfully!');
  console.log('Lambda Event', event);
  console.log('Lambda Context', context);
  console.log('Test');
  h([1, 2, 3]).each((x) => {
    console.log(x);
  });
  h([4, 5, 6]).each((x) => {
    console.log(x);
  });
  await fromStacks(cfn).forEach((stack) => {
    console.log('Stack Info: ', stack);
  });
  await fromPoliciesV2(iam)
    .tap((policy) => {
      console.log('Policy: ', policy);
    })
    .errors((err) => {
      console.error(err);
    })
    .collect()
    .toPromise(Promise);
  return serviceA(s3)
    .tap((res) => {
      console.log('Name: ', res.bucket);
      console.log('Content: ', res.objects);
      console.log('Extra Info: ', res.extraInfo);
    })
    .collect()
    .errors((err) => {
      console.error(err.message);
    })
    .toPromise(Promise);
}
