const child = require('child_process');
const { exit } = require('process');

const tagParseRegex =
  /^(?<service>.+)[-.+:](?<tag>v\d+\.\d+\.\d+)[-.+:]*(?<suffix>.*$)/;
const getTagParts = (tag) => {
  const match = tag.match(tagParseRegex);
  if (match) {
    return {
      service: match.groups.service,
      tag: match.groups.tag,
      suffix: match.groups.suffix,
    };
  }
};

const runCommand = async (command) => {
  const promise = new Promise((resolve, reject) => {
    const proc = child.exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout);
    });
    proc.stdout.pipe(process.stdout);
    proc.stderr.pipe(process.stderr);
  });
  try {
    const result = await promise;
    return result.toString('utf8');
  } catch {
    exit(1);
  }
};

const main = async () => {
  const isCi = process.env['CI'];
  const gitTag = process.env['GIT_TAG'];
  const namespace = process.env['NAMESPACE']?.toLowerCase();

  if (!isCi) {
    console.error('ERROR: this commmand should only be run during CI/CD');
    exit(1);
  }

  if (!namespace) {
    console.error('ERROR: no NAMESPACE is set for the environment');
    exit(1);
  }

  if (!gitTag) {
    console.error('ERROR: no GIT_TAG is set for the environment');
    exit(1);
  }
  const parts = getTagParts(gitTag);
  if (!parts) {
    console.error(
      `ERROR: could not parse service to deploy for tag (${gitTag})`,
    );
    exit(1);
  }

  const { service, tag, suffix } = parts;

  const cdkDeployCommand = `nx run ${service}:deploy --require-approval=never --context namespace=${namespace}`;
  await runCommand(cdkDeployCommand);

  const
};

main();
