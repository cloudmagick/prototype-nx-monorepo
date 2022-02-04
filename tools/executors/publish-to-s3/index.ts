import { ExecutorContext } from '@nrwl/devkit';
import child from 'child_process';
import { exit } from 'process';

export interface PublishToS3Options {
  localPath: string;
  bucket: string;
  prefix?: string;
  region: string;
}

export default async function executor(
  options: PublishToS3Options,
  context: ExecutorContext,
) {
  const { localPath, bucket, prefix } = options;
  const awsS3SyncCommand = `aws s3 sync ${localPath} s3://${bucket}${
    prefix ? '/' + prefix : ''
  }`;
  runC;
}

const runCommand = (command: string) => {
  try {
    const result = child.execSync(command);
    return result.toString('utf8');
  } catch (ex) {
    exit(1);
  }
};
