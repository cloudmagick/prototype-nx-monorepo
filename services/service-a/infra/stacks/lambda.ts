import * as cdk from 'aws-cdk-lib';
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
    });

    lambda.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['s3:*'],
        resources: ['*'],
      }),
    );
  }
}
