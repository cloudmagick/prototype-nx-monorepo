const fs = require('fs');

const packageJson = JSON.parse(
  fs.readFileSync('package.json', { encoding: 'utf8' }),
);

const deployPackageJson = {
  ...packageJson,
  dependencies: undefined,
};

if (!fs.existsSync('docker/assets')) {
  fs.mkdirSync('docker/assets');
}

fs.writeFileSync(
  'docker/assets/package.json',
  JSON.stringify(deployPackageJson, null, 2),
);
fs.copyFileSync('package-lock.json', 'docker/assets/package-lock.json');
