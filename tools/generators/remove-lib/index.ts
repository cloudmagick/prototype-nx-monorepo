import { Tree, formatFiles, installPackagesTask } from '@nrwl/devkit';
import { libraryGenerator, removeGenerator } from '@nrwl/workspace/generators';

export default async function (tree: Tree, schema: any) {
  await removeGenerator(tree, schema);
  await formatFiles(tree);
  return () => {
    installPackagesTask(tree);
  };
}
