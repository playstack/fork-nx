import {
  addDependenciesToPackageJson,
  createProjectGraphAsync,
  formatFiles,
  GeneratorCallback,
  readNxJson,
  removeDependenciesFromPackageJson,
  runTasksInSerial,
  Tree,
} from '@nx/devkit';
import { addPlugin } from '@nx/devkit/src/utils/add-plugin';
import { createNodesV2 } from '../../../plugins/plugin';
import {
  expoCliVersion,
  expoVersion,
  nxVersion,
  reactDomVersion,
  reactNativeVersion,
  reactVersion,
} from '../../utils/versions';

import { addGitIgnoreEntry } from './lib/add-git-ignore-entry';
import { Schema } from './schema';

export function expoInitGenerator(tree: Tree, schema: Schema) {
  return expoInitGeneratorInternal(tree, { addPlugin: false, ...schema });
}

export async function expoInitGeneratorInternal(host: Tree, schema: Schema) {
  const nxJson = readNxJson(host);
  const addPluginDefault =
    process.env.NX_ADD_PLUGINS !== 'false' &&
    nxJson.useInferencePlugins !== false;
  schema.addPlugin ??= addPluginDefault;

  addGitIgnoreEntry(host);

  if (schema.addPlugin) {
    await addPlugin(
      host,
      await createProjectGraphAsync(),
      '@nx/expo/plugin',
      createNodesV2,
      {
        startTargetName: ['start', 'expo:start', 'expo-start'],
        buildTargetName: ['build', 'expo:build', 'expo-build'],
        prebuildTargetName: ['prebuild', 'expo:prebuild', 'expo-prebuild'],
        serveTargetName: ['serve', 'expo:serve', 'expo-serve'],
        installTargetName: ['install', 'expo:install', 'expo-install'],
        exportTargetName: ['export', 'expo:export', 'expo-export'],
        submitTargetName: ['submit', 'expo:submit', 'expo-submit'],
        runIosTargetName: ['run-ios', 'expo:run-ios', 'expo-run-ios'],
        runAndroidTargetName: [
          'run-android',
          'expo:run-android',
          'expo-run-android',
        ],
        buildDepsTargetName: [
          'build-deps',
          'expo:build-deps',
          'expo-build-deps',
        ],
        watchDepsTargetName: [
          'watch-deps',
          'expo:watch-deps',
          'expo-watch-deps',
        ],
      },

      schema.updatePackageScripts
    );
  }

  const tasks: GeneratorCallback[] = [];
  if (!schema.skipPackageJson) {
    tasks.push(moveDependency(host));
    tasks.push(updateDependencies(host, schema));
  }

  if (!schema.skipFormat) {
    await formatFiles(host);
  }

  return runTasksInSerial(...tasks);
}

export function updateDependencies(host: Tree, schema: Schema) {
  return addDependenciesToPackageJson(
    host,
    {
      react: reactVersion,
      'react-dom': reactDomVersion,
      'react-native': reactNativeVersion,
      expo: expoVersion,
    },
    {
      '@nx/expo': nxVersion,
      '@expo/cli': expoCliVersion,
    },
    undefined,
    schema.keepExistingVersions
  );
}

function moveDependency(host: Tree) {
  return removeDependenciesFromPackageJson(host, ['@nx/react-native'], []);
}

export default expoInitGenerator;
