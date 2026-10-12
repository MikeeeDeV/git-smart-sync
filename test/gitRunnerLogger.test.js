const { test, describe } = require('node:test');
const assert = require('node:assert');
const { GitRunner, GitError } = require('../dist/git/gitRunner');

describe('GitRunner with Logger', () => {
  test('should record commands to logger', async () => {
    const loggedCommands = [];
    const mockLogger = {
      command(args, cwd) {
        loggedCommands.push({ args, cwd });
      }
    };

    const runner = new GitRunner(mockLogger);
    const output = await runner.execute(['--version'], process.cwd());
    assert.match(output, /^git version/);
    assert.strictEqual(loggedCommands.length, 1);
    assert.deepStrictEqual(loggedCommands[0].args, ['--version']);
    assert.strictEqual(loggedCommands[0].cwd, process.cwd());
  });

  test('should record error to logger on failure', async () => {
    const loggedErrors = [];
    const mockLogger = {
      error(msg, err) {
        loggedErrors.push({ msg, err });
      }
    };

    const runner = new GitRunner(mockLogger);
    await assert.rejects(async () => {
      await runner.execute(['non-existent-subcommand-12345'], process.cwd());
    });

    assert.strictEqual(loggedErrors.length, 1);
    assert.ok(loggedErrors[0].msg.includes('failed'));
  });
});
