import * as yargs from 'yargs';

import {
  withAffectedOptions,
  withOutputStyleOption,
  withRunManyOptions,
} from './shared-options';
import { withEnvironmentVariables } from '../../internal-testing-utils/with-environment';

const argv = yargs.default([]);

describe('shared-options', () => {
  describe('withAffectedOptions', () => {
    const command = withAffectedOptions(argv);

    it('should parse files to array', () => {
      const result = command.parseSync([
        'affected',
        '--files',
        'file1',
        '--files',
        'file2',
        '--tag',
        '81919e4',
        '--parallel',
        '3',
        '--maxParallel',
        '2',
      ]);
      expect(result).toEqual(
        expect.objectContaining({
          _: ['affected', '--tag', '81919e4'],
          files: ['file1', 'file2'],
          parallel: '3',
          maxParallel: 2,
        })
      );
    });

    it('should parse head and base', () => {
      const result = command.parseSync([
        'affected',
        '--head',
        'head',
        '--base',
        'base',
      ]);
      expect(result).toEqual(
        expect.objectContaining({
          _: ['affected'],
          head: 'head',
          base: 'base',
        })
      );
    });
  });

  describe('withRunManyOptions', () => {
    const command = withRunManyOptions(argv);

    it('should parse projects to array', () => {
      const result = command.parseSync([
        'run-many',
        '--projects',
        'project1',
        '--projects',
        'project2',
        '--tag',
        '81919e4',
        '--parallel',
        '3',
        '--maxParallel',
        '2',
      ]);
      expect(result).toEqual(
        expect.objectContaining({
          _: ['run-many', '--tag', '81919e4'],
          projects: ['project1', 'project2'],
          parallel: '3',
          maxParallel: 2,
        })
      );
    });
  });

  describe('withOutputStyle', () => {
    it('should coerce outputStyle based on NX_TUI', () =>
      withEnvironmentVariables(
        {
          NX_TUI: 'true',
          CI: 'false',
          NX_TUI_SKIP_CAPABILITY_CHECK: 'true',
        },
        () => {
          const command = withOutputStyleOption(argv);
          const result = command.parseSync([]);
          expect(result['output-style']).toEqual('tui');
        }
      ));

    it('should set NX_TUI if using not set', () =>
      withEnvironmentVariables(
        {
          NX_TUI: false,
          CI: 'false',
          NX_TUI_SKIP_CAPABILITY_CHECK: 'true',
        },
        () => {
          const command = withOutputStyleOption(argv);
          const result = command.parseSync([]);
          expect(process.env.NX_TUI).toEqual('true');
        }
      ));

    it.each(['dynamic', 'tui'])(
      'should set NX_TUI if using output-style=%s',
      () =>
        withEnvironmentVariables(
          {
            NX_TUI: false,
            CI: 'false',
            NX_TUI_SKIP_CAPABILITY_CHECK: 'true',
          },
          () => {
            const command = withOutputStyleOption(argv);
            const result = command.parseSync(['--output-style', 'dynamic']);
            expect(process.env.NX_TUI).toEqual('true');
          }
        )
    );
  });
});
