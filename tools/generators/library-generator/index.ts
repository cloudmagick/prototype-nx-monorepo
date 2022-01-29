import {
  Tree,
  formatFiles,
  names,
  getWorkspaceLayout,
  joinPathFragments,
} from '@nrwl/devkit';
import { FsTree } from '@nrwl/tao/src/shared/tree';
import { libraryGenerator } from '@nrwl/js';
import { libraryGenerator as nodeLibraryGenerator } from '@nrwl/node';
import { GeneratorSchema as JSLibraryGeneratorSchema } from '@nrwl/js/src/utils/schema';

type GeneratorSchema = JSLibraryGeneratorSchema & {
  config: 'workspace' | 'project';
  publishable: boolean;
};

export default async function (tree: Tree, schema: GeneratorSchema) {
  const typescriptLibraryInstall = await libraryGenerator(tree, schema);
  const nodeLibTree = new FsTree(tree.root, false);
  const nodeLibraryInstall = await nodeLibraryGenerator(nodeLibTree, schema);

  if (schema.publishable) {
    const configPath =
      schema.config == 'project'
        ? `${getProjectRoot(tree, schema)}/project.json`
        : 'workspace.json';
    const tsLibConfig = JSON.parse(tree.read(configPath, 'utf8'));
    const nodeLibConfig = JSON.parse(nodeLibTree.read(configPath, 'utf8'));
    let finalConfig = {
      ...tsLibConfig,
    };
    if (schema.config == 'project') {
      finalConfig.targets['package'] = nodeLibConfig.targets.build;
    } else {
      finalConfig.projects[schema.name].targets['package'] =
        nodeLibConfig.projects[schema.name].targets['package'];
    }
    tree.write(configPath, JSON.stringify(finalConfig));
  }
  await formatFiles(tree);
  return () => {
    typescriptLibraryInstall();
    nodeLibraryInstall();
  };
}

function getProjectRoot(tree: Tree, schema: GeneratorSchema) {
  const { libsDir } = getWorkspaceLayout(tree);
  const name = names(schema.name).fileName;
  const projectDirectory = schema.directory
    ? `${names(schema.directory).fileName}/${name}`
    : name;
  const projectRoot = joinPathFragments(libsDir, projectDirectory);

  return projectRoot;
}

// function normalizeOptions(tree: Tree, options: GeneratorSchema): NormalizedSchema {
//   const { npmScope, libsDir } = getWorkspaceLayout(tree);
//   const defaultPrefix = npmScope;
//   const name = names(options.name).fileName;
//   const projectDirectory = options.directory
//     ? `${names(options.directory).fileName}/${name}`
//     : name;

//   const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
//   const fileName = getCaseAwareFileName({
//     fileName: options.simpleModuleName ? name : projectName,
//     pascalCaseFiles: options.pascalCaseFiles,
//   });
//   const projectRoot = joinPathFragments(libsDir, projectDirectory);

//   const parsedTags = options.tags
//     ? options.tags.split(',').map((s) => s.trim())
//     : [];

//   const importPath =
//     options.importPath || `@${defaultPrefix}/${projectDirectory}`;

//   return {
//     ...options,
//     prefix: defaultPrefix, // we could also allow customizing this
//     fileName,
//     name: projectName,
//     projectRoot,
//     projectDirectory,
//     parsedTags,
//     importPath,
//   };
// }

// function getCaseAwareFileName(options: {
//   pascalCaseFiles: boolean;
//   fileName: string;
// }) {
//   const normalized = names(options.fileName);

//   return options.pascalCaseFiles ? normalized.className : normalized.fileName;
// }

// function updateProject(tree: Tree, options: GeneratorSchema) {
//   if (!options.publishable) {
//     return;
//   }

//   const project = readProjectConfiguration(tree, options.name);
//   const { libsDir } = getWorkspaceLayout(tree);
//   const name = names(options.name).fileName;
//   const projectDirectory = options.directory
//     ? `${names(options.directory).fileName}/${name}`
//     : name;

//   project.targets = project.targets || {};
//   project.targets.package = {
//     executor: '@nrwl/node:package',
//     outputs: ['{options.outputPath}'],
//     options: {
//       outputPath: `dist/${libsDir}/${options.projectDirectory}`,
//       tsConfig: `${options.projectRoot}/tsconfig.lib.json`,
//       packageJson: `${options.projectRoot}/package.json`,
//       main: `${options.projectRoot}/src/index` + (options.js ? '.js' : '.ts'),
//       assets: [`${options.projectRoot}/*.md`],
//     },
//   };

//   updateProjectConfiguration(tree, options.name, project);
// }
