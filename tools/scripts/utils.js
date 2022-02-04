const child = require('child_process');
const { exit } = require('process');

const tagParseRegex =
  /^(?<service>.+)[-.+:](?<version>\d+\.\d+\.\d+)[-.+:]*(?<suffix>.*$)/;
export const getTagParts = (tag) => {
  const match = tag.match(tagParseRegex);
  if (match) {
    return {
      service: match.groups.service,
      version: match.groups.version,
      suffix: match.groups.suffix,
    };
  }
};

const versionTagParseRegex =
  /^(?<version>\d+\.\d+\.\d+\.)[-.+:]*(?<suffix>.*$)/;
export const getVersionTag = (tag) => {
  const match = tag.match(tagParseRegex);
  if (match) {
    return {
      version: match.groups.version,
      suffix: match.groups.suffix,
    };
  }
};

export const runCommand = async (command) => {
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
