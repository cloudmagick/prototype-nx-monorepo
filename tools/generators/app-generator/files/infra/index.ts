import { App } from 'aws-cdk-lib';
import { S3ArtifactStack } from './stacks/s3-artifacts-stack';

const app = new App();
const region = process.env.CDK_DEFAULT_REGION;
const account = process.env.CDK_DEFAULT_ACCOUNT;
new S3ArtifactStack(app, 'S3ArtifactStack', {
  stackName: 'prototype-nx-monorepo-artifact-bucket-stack',
  bucketName: `prototype-nx-monorepo-artifact-bucket-${region}-${account}`,
  env: { account, region },
});
