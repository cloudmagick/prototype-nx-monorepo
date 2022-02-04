const { EOL } = require('os');
const { exit } = require('process');
const { getTagParts, runCommand } = require('./utils');

const main = async () => {
  const isCi = process.env['CI'];
  const gitTag = process.env['GIT_TAG'];

  if (!isCi) {
    console.error('ERROR: this commmand should only be run during CI/CD');
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

  const packageJson = JSON.parse(
    fs.readFileSync('package.json', { encoding: 'utf8' }),
  );

  const deployEnvironments = packageJson.config?.deployEnvironments;
  if (!deployEnvironments) {
    console.error(`ERROR: No deploy environments have been configured.`);
    exit(1);
  }

  const { service, version, suffix } = parts;

  const environmentKeys = Object.keys(deployEnvironments);
  const deployEnvironment = environmentKeys.find((key) => suffix.contains(key));
  if (!deployEnvironment) {
    console.warn(
      [
        'WARNING: Tag suffix did not match any deployment environments',
        `[tag: ${gitTag} suffix: ${suffix}, environments: `,
        environmentKeys.join(','),
        `${EOL}Skipping deployment...`,
      ].join(''),
    );
    exit(0);
  }

  const cdkDeployCommand = `nx run ${service}:deploy --require-approval=never --context namespace=${deployEnvironment}`;
  await runCommand(cdkDeployCommand);

  const setLatestTagForEnvironmentCommand = `git tag ${service}-${deployEnvironment} && git push --tags`;
  await runCommand(setLatestTagForEnvironmentCommand);
};

main();
