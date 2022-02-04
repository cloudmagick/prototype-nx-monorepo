const child = require('child_process');
const { exit } = require('process');

const tagParseRegex =
  /^(?<service>.+)[-.+:](?<tag>v\d\.\d\.\d)[^a-zA-Z0-9]*(?<suffix>.*$)/;
const getTagParts = (tag) => {
  const match = tag.match(tagParseRegex);
  console.log(match);
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
  const gitTag = process.env['GIT_TAG'];
  if (!gitTag) {
    console.log('ERROR: no GIT_TAG is set for the environment');
    exit(1);
  }
  const parts = getTagParts(gitTag);
  console.log(parts);
  if (!parts) {
    console.log(`ERROR: could not parse service to deploy for tag (${gitTag})`);
    exit(1);
  }

  const { service, tag, suffix } = parts;

  const cdkDeployCommand = `nx run ${service}:deploy --require-approval=never`;
  await runCommand(cdkDeployCommand);
};

main();
