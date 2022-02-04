import * as cdk from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { BlockPublicAccess, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';

interface S3ArtifactBucketProps extends cdk.StackProps {
  bucketName: string;
  organizationId?: string;
}

export class S3ArtifactStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: S3ArtifactBucketProps) {
    super(scope, id, props);

    const { organizationId, bucketName } = props;

    const bucket = new s3.Bucket(this, 'S3ArtifactBucket', {
      bucketName,
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      versioned: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    if (organizationId) {
      bucket.addToResourcePolicy(
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['s3:GetObject', 's3:ListBucket'],
          resources: [`${bucket.bucketArn}`, `${bucket.bucketArn}/*`],
          conditions: {
            StringEquals: {
              'aws:PrincipalOrgId': [organizationId],
            },
          },
        }),
      );
    }
  }
}
