const { test, describe } = require('node:test');
const assert = require('node:assert');
const { GitRunner, GitError } = require('../dist/git/gitRunner');

describe('GitRunner', () => {
  const runner = new GitRunner();

  test('should execute a valid git command and return output', async () => {
    const output = await runner.execute(['--version'], process.cwd());
    assert.match(output, /^git version/);
  });

  test('should throw a GitError with command details on invalid arguments', async () => {
    await assert.rejects(
      async () => {
        await runner.execute(['invalid-subcommand-xyz'], process.cwd());
      },
      (err) => {
        assert.ok(err instanceof GitError);
        assert.strictEqual(err.command, 'git');
        assert.ok(err.args.includes('invalid-subcommand-xyz'));
        return true;
      }
    );
  });

  test('should resolve rev-parse in current repository', async () => {
    const root = await runner.execute(['rev-parse', '--show-toplevel'], process.cwd());
    assert.ok(root.length > 0);
  });
});
