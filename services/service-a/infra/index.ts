import { App } from 'aws-cdk-lib';
import { EOL } from 'os';
import { exit } from 'process';
import { LambdaStack } from './stacks/lambda';

const app = new App();
const region = process.env.CDK_DEFAULT_REGION;
const account = process.env.CDK_DEFAULT_ACCOUNT;
const assetsPath = app.node.tryGetContext('assetsPath');
const namespace = app.node.tryGetContext('namespace');
if (!assetsPath) {
  console.error('ERROR: assetsPath is required' + EOL);
  exit(1);
}
if (!namespace) {
  console.error('ERROR: namespace is required' + EOL);
  exit(1);
}
new LambdaStack(app, 'LambdaStack', {
  stackName: `service-a-stack-${namespace}`,
  env: { account, region },
  assetsPath,
});
