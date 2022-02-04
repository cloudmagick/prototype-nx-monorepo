import { App } from 'aws-cdk-lib';
import { LambdaStack } from './stacks/lambda';

const app = new App();
const region = process.env.CDK_DEFAULT_REGION;
const account = process.env.CDK_DEFAULT_ACCOUNT;
const assetsPath = app.node.tryGetContext('assetsPath');
new LambdaStack(app, 'LambdaStack', {
  stackName: 'service-a-stack',
  env: { account, region },
  assetsPath,
});
