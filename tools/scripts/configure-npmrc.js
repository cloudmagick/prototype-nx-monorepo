const fs = require('fs');
const child = require('child_process');
const os = require('os');
const { inspect } = require('util');
const { exit } = require('process');

const validateNpmrcConfig = (config) => {
  if (!config.codeArtifact?.registries) {
    return false;
  }
  const registries = config.codeArtifact.registries;
  registries.forEach((registry, idx) => {
    const { domain, repository } = registry;
    const required = [
      ['domain', domain],
      ['repository', repository],
    ];
    for (const kvp of required) {
      const [field, value] = kvp;
      if (!value) {
        throw new Error(
          `Required parameter ${field} is missing from config.codeArtfiact.registries[${idx}]`,
        );
      }
    }
  });

  return true;
};

const runCommand = (command) => {
  try {
    const result = child.execSync(command);
    return result.toString('utf8');
  } catch (ex) {
    exit(1);
  }
};

const configureRegistries = (config, npmrc) => {
  if (!config.codeArtifact?.registries) {
    return;
  }
  npmrc = npmrc || [];
  const registries = config.codeArtifact.registries;
  for (const registry of registries) {
    const { domain, domainOwner, repository, scopes, region } = registry;
    const getAuthorizationTokenCommand = [
      `aws --region ${region}`,
      'codeartifact get-authorization-token',
      `--domain ${domain}`,
      domainOwner ? `--domain-owner ${domainOwner}` : '',
      '--query authorizationToken --output text',
    ].join(' ');

    const getRepositoryEndpointCommand = [
      `aws --region ${region}`,
      'codeartifact get-repository-endpoint',
      `--domain ${domain}`,
      `--repository ${repository}`,
      domainOwner ? `--domain-owner ${domainOwner}` : '',
      '--format npm',
    ].join(' ');

    const token = runCommand(getAuthorizationTokenCommand);
    const repositoryEndpoint = JSON.parse(
      runCommand(getRepositoryEndpointCommand),
    ).repositoryEndpoint;
    const protocolSpecifcEndpoint = repositoryEndpoint.replace(/^https:/, '');

    for (const scope of scopes) {
      const npmScope = scope.startsWith('@') ? scope : `@${scope}`;

      const configPairs = [
        [`${npmScope}:registry`, repositoryEndpoint],
        [`${protocolSpecifcEndpoint}:always-auth`, 'true'],
        [`${protocolSpecifcEndpoint}:_authToken`, token],
      ];

      const rcConfig = configPairs.map((entry) => entry.join('='));
      npmrc.push(...rcConfig);
    }
  }
};

const createNpmrc = (npmrc) => {
  const npmrcString = npmrc.join(os.EOL);
  fs.writeFileSync('.npmrc', npmrcString);
};

const main = () => {
  const packageJson = JSON.parse(
    fs.readFileSync('package.json', { encoding: 'utf8' }),
  );

  const npmrcConfig = packageJson.config?.['configure-npmrc'];
  if (!npmrcConfig) {
    return;
  }

  if (!validateNpmrcConfig(npmrcConfig)) {
    return;
  }

  const npmrc = [];
  configureRegistries(npmrcConfig, npmrc);
  createNpmrc(npmrc);
};

main();
