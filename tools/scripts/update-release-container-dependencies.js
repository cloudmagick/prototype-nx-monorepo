const fs = require('fs');

/**
 * This uses the `packages.dependencies.json` for the release-container
 * to determine what packages should be included when building the
 * release-container. In genernal, this should only include the dependencies
 * needed to do a release (it should not build _any_ packages)
 */

const packageJson = JSON.parse(
  fs.readFileSync('package.json', { encoding: 'utf8' }),
);

const dependeciesJson = JSON.parse(
  fs.readFileSync('docker/release-container/package.dependencies.json', {
    encoding: 'utf8',
  }),
);

const deployPackageJson = Object.entries({
  ...packageJson,
  ...dependeciesJson,
}).reduce((acc, [key, value]) => {
  if (value) {
    acc[key] = value;
  }
  return acc;
}, {});

// merge dependencies with packages from workspace package.json
// unlikely you will actually want "production" dependencies in the
// release container, but added here just in case
if (deployPackageJson.dependencies) {
  const dependencies = packageJson.dependecies;
  Object.keys(deployPackageJson.dependecies).forEach((package) => {
    if (dependencies[package]) {
      deployPackageJson.dependecies[package] = dependencies[package];
    }
  });
}

// merge devDependencies with packages from workspace package.json
if (deployPackageJson.devDependencies) {
  const dependencies = packageJson.devDependencies;
  Object.keys(deployPackageJson.devDependencies).forEach((package) => {
    if (dependencies[package]) {
      deployPackageJson.devDependencies[package] = dependencies[package];
    }
  });
}

// merge scripts with scripts from workspace package.json
if (deployPackageJson.scripts) {
  const scripts = packageJson.scripts;
  Object.keys(deployPackageJson.scripts).forEach((script) => {
    if (scripts[script]) {
      deployPackageJson.scripts[script] = scripts[script];
    }
  });
}

fs.writeFileSync(
  'docker/release-container/package.json',
  JSON.stringify(deployPackageJson, null, 2),
);
fs.copyFileSync(
  'package-lock.json',
  'docker/release-container/package-lock.json',
);
