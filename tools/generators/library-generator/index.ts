import {
  Tree,
  formatFiles,
  readJson,
  writeJson,
  visitNotIgnoredFiles,
  logger,
  joinPathFragments,
} from '@nrwl/devkit';
import { FsTree } from '@nrwl/tao/src/shared/tree';
import { libraryGenerator } from '@nrwl/js';
import { libraryGenerator as nodeLibraryGenerator } from '@nrwl/node';
import { GeneratorSchema as JSLibraryGeneratorSchema } from '@nrwl/js/src/utils/schema';
import install from '@jscutlery/semver/src/generators/install';
import { SchemaOptions as SemverSchemaOptions } from '@jscutlery/semver/src/generators/install/schema';
import { getConfigPath, getProjectRoot, getProjectTargets } from '../utils';
import { basename } from 'path';

type GeneratorSchema = JSLibraryGeneratorSchema &
  SemverSchemaOptions & {
    config: 'workspace' | 'project';
    publishable: boolean;
    useSemver: boolean;
    testsDirectory: string;
  };

export default async function (tree: Tree, schema: GeneratorSchema) {
  const typescriptLibraryInstall = await libraryGenerator(tree, schema);

  const nodeLibTree = new FsTree(tree.root, false);
  const nodeLibraryInstall = await nodeLibraryGenerator(nodeLibTree, schema);

  if (schema.publishable) {
    mergePublishableTree(tree, nodeLibTree, schema);
  }
  const semverLibraryInstall = schema.useSemver
    ? await semverInstall(tree, schema)
    : () => {};

  moveTestsToProjectRoot(tree, schema);

  await formatFiles(tree);
  return () => {
    typescriptLibraryInstall();
    nodeLibraryInstall();
    semverLibraryInstall();
  };
}

async function moveTestsToProjectRoot(tree: Tree, schema: GeneratorSchema) {
  const projectRoot = getProjectRoot(tree, schema);
  if (schema.unitTestRunner != 'jest' && schema.testsDirectory) {
    logger.warn('`testsDirectory` option is only supported for jest');
  }
  if (!schema.testsDirectory?.length) {
    return;
  }

  const testsPath = joinPathFragments(`${projectRoot}`, schema.testsDirectory);
  visitNotIgnoredFiles(tree, projectRoot, (path) => {
    if (path.endsWith('.spec.ts')) {
      const filename = basename(path);
      const newPath = `${testsPath}/${filename}`;
      tree.rename(path, newPath);
    }
  });
}

async function semverInstall(tree: Tree, schema: GeneratorSchema) {
  const semverLibraryInstall = await install(tree, {
    ...schema,
    projects: [schema.name],
  });

  if (schema.publishable) {
    const configPath = getConfigPath(tree, schema);
    const projectConfig = readJson(tree, configPath);
    const targets = getProjectTargets(projectConfig, schema);

    const packageOutputPath = targets['package']?.options?.outputPath;

    if (packageOutputPath) {
      targets['publish'] = {
        executor: '@nrwl/workspace:run-commands',
        options: {
          commands: [
            {
              command: `npm publish ${packageOutputPath}`,
            },
          ],
        },
      };

      const versionTarget = targets['version'];
      if (versionTarget) {
        const packageTarget = `${schema.name}:package`;
        const publishTarget = `${schema.name}:publish`;
        versionTarget.options['postTargets'] = [packageTarget, publishTarget];
      }

      writeJson(tree, configPath, projectConfig);
    }
  }

  return semverLibraryInstall;
}

function mergePublishableTree(
  tree: Tree,
  nodeLibTree: Tree,
  schema: GeneratorSchema,
) {
  const configPath = getConfigPath(tree, schema);
  const tsLibConfig = readJson(tree, configPath);
  const nodeLibConfig = readJson(nodeLibTree, configPath);
  const finalConfig = {
    ...tsLibConfig,
  };
  const finalTargets = getProjectTargets(finalConfig, schema);
  const nodeTargets = getProjectTargets(nodeLibConfig, schema);
  finalTargets['package'] = nodeTargets['build'];

  writeJson(tree, configPath, finalConfig);
}
