import * as cdk from 'aws-cdk-lib';
import { Duration } from 'aws-cdk-lib';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';

interface LambdaStackProps extends cdk.StackProps {
  assetsPath: string;
}

export class LambdaStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    const { assetsPath } = props;

    const lambda = new Function(this, 'LambdaFunction', {
      code: Code.fromAsset(assetsPath),
      runtime: Runtime.NODEJS_14_X,
      handler: 'src/entrypoint.handler',
      timeout: Duration.seconds(60),
      memorySize: 256,
    });

    lambda.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['s3:*'],
        resources: ['*'],
      }),
    );
    lambda.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['cloudformation:ListStacks', 'cloudformation:DescribeStacks'],
        resources: ['*'],
      }),
    );
    lambda.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['iam:ListPolicies', 'iam:GetPolicyVersion'],
        resources: ['*'],
      }),
    );
  }
}
