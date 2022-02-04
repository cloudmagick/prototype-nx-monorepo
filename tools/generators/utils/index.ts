import {
  Tree,
  names,
  getWorkspaceLayout,
  joinPathFragments,
  ProjectConfiguration,
  WorkspaceJsonConfiguration,
} from '@nrwl/devkit';
import { GeneratorSchema } from '@nrwl/js/src/utils/schema';

export function getProjectTargets(
  config: ProjectConfiguration | WorkspaceJsonConfiguration,
  schema: GeneratorSchema,
) {
  return schema.config == 'project'
    ? (config as ProjectConfiguration).targets
    : (config as WorkspaceJsonConfiguration).projects[schema.name].targets;
}

export function getConfigPath(tree: Tree, schema: GeneratorSchema) {
  const configPath =
    schema.config == 'project'
      ? `${getProjectRoot(tree, schema)}/project.json`
      : 'workspace.json';
  return configPath;
}

export function getProjectRoot(tree: Tree, schema: GeneratorSchema) {
  const { libsDir } = getWorkspaceLayout(tree);
  const name = names(schema.name).fileName;
  const projectDirectory = schema.directory
    ? `${names(schema.directory).fileName}/${name}`
    : name;
  const projectRoot = joinPathFragments(libsDir, projectDirectory);

  return projectRoot;
}
