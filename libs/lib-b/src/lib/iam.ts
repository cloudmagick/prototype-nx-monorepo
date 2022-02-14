import { IAM } from 'aws-sdk';
import stream from 'highland';
import { filter, from, map, mergeMap, Observable } from 'rxjs';

export function fromPolicies(iam: IAM, req?: IAM.ListPoliciesRequest) {
  return listPolicies(iam).pipe(
    mergeMap((policy) => getPolicy(iam, policy.Arn as string)),
  );
}

export function fromPoliciesV2(iam: IAM, req?: IAM.ListPoliciesRequest) {
  return listPoliciesV2(iam, {
    ...req,
    MaxItems: req?.MaxItems ?? 1000,
  })
    .through(getPolicyDocument(iam))
    .parallel(100);
}

function listPoliciesV2(iam: IAM, req?: IAM.ListPoliciesRequest) {
  let marker = req?.Marker;
  return stream<IAM.Policy>((push, next) => {
    (async function () {
      let isTruncated = false;
      try {
        const response = await iam
          .listPolicies({ ...req, Marker: marker })
          .promise();
        isTruncated = response.IsTruncated ?? false;
        marker = response.Marker;
        (response.Policies ?? []).forEach((policy) => {
          push(null, policy);
        });
      } catch (err) {
        push(err as Error);
      } finally {
        if (isTruncated) {
          next();
        } else {
          push(null, stream.nil);
        }
      }
    })();
  });
}

function getPolicyDocument(iam: IAM) {
  return (s: Highland.Stream<IAM.Policy>) =>
    s.map((policy) =>
      stream(
        iam
          .getPolicyVersion({
            PolicyArn: policy.Arn as string,
            VersionId: policy.DefaultVersionId as string,
          })
          .promise()
          .then((res) => ({
            policy,
            policyDocument: res.PolicyVersion,
          })),
      ),
    );
}

function isAwsManagedPolicy(policy: IAM.Policy) {
  return (policy.Arn as string).startsWith('arn:aws:iam::aws:policy');
}

function getPolicy(iam: IAM, policyArn: string) {
  return from(
    iam
      .getPolicy({
        PolicyArn: policyArn,
      })
      .promise(),
  ).pipe(
    map((res) => res.Policy),
    filter((policy) => !!policy),
  ) as Observable<IAM.Policy>;
}

function listPolicies(iam: IAM) {
  return new Observable<IAM.Policy>((subscriber) => {
    let shouldContinue = true;
    async function get(marker?: string): Promise<void> {
      try {
        const policyList = await iam
          .listPolicies({
            Marker: marker,
          })
          .promise();

        (policyList.Policies ?? []).forEach((policy) => {
          subscriber.next(policy);
        });

        const { IsTruncated, Marker } = policyList;
        if (IsTruncated && shouldContinue) {
          await get(Marker);
        }
      } catch (err) {
        subscriber.error(err);
      }
    }

    get().finally(() => subscriber.complete());

    return () => {
      shouldContinue = false;
      subscriber.unsubscribe();
    };
  });
}
