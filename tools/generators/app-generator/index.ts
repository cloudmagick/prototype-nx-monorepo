import { Tree, formatFiles } from '@nrwl/devkit';
import { applicationGenerator } from '@nrwl/js/src/generators/application/application';

export default async function (tree: Tree, schema: any) {
  const typescriptApplicationInstall = await applicationGenerator(tree, {
    name: schema.name,
  });
  await formatFiles(tree);
  return () => {
    typescriptApplicationInstall();
  };
}
