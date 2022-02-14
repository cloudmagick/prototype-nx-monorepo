import { CloudFormation } from 'aws-sdk';
import { from, mergeMap, Observable } from 'rxjs';

export function fromStacks(cfn: CloudFormation) {
  return listStacksV2(cfn).pipe(
    mergeMap(({ StackName }) => describeStacks(cfn, StackName), 20),
  );
}

function describeStacks(cfn: CloudFormation, stackName: string) {
  return from(
    cfn
      .describeStacks({
        StackName: stackName,
      })
      .promise(),
  ).pipe(mergeMap((res) => res.Stacks ?? []));
}

function listStacksV2(cfn: CloudFormation) {
  return new Observable<CloudFormation.Stack>((subscriber) => {
    let shouldContinue = true;
    async function get(token?: string): Promise<void> {
      try {
        const res = await cfn
          .listStacks({
            NextToken: token,
          })
          .promise();
        const summary = {
          StackSummaries: res.StackSummaries,
          NextToken: res.NextToken,
        };
        (res.StackSummaries ?? []).forEach((stack) => {
          subscriber.next(stack);
        });
        if (summary.NextToken && shouldContinue) {
          await get(summary.NextToken);
        }
      } catch (err) {
        subscriber.error(err);
      }
    }

    get().finally(() => {
      subscriber.complete();
    });
    return () => {
      shouldContinue = false;
      subscriber.unsubscribe();
    };
  });
}
