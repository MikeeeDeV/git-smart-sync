const { test, describe } = require('node:test');
const assert = require('node:assert');
const { GitRunner } = require('../dist/git/gitRunner');
const { BranchService } = require('../dist/git/branchService');
const { SyncEngine } = require('../dist/sync/syncEngine');

describe('SyncEngine', () => {
  const runner = new GitRunner();
  const branchService = new BranchService(runner);
  const engine = new SyncEngine(runner, branchService);
  const cwd = process.cwd();

  test('should handle empty branch list gracefully', async () => {
    const report = await engine.syncBranches([], cwd, 'main', { remote: 'origin' });
    assert.strictEqual(report.results.length, 0);
    assert.strictEqual(report.successCount, 0);
    assert.strictEqual(report.failedCount, 0);
    assert.strictEqual(report.skippedCount, 0);
  });

  test('should execute dry-run without performing network pushes', async () => {
    const report = await engine.syncBranches(['test-dry-branch'], cwd, 'main', {
      remote: 'origin',
      dryRun: true
    });

    assert.strictEqual(report.results.length, 1);
    assert.strictEqual(report.results[0].status, 'success');
    assert.ok(report.results[0].message?.includes('[Dry Run]'));
    assert.strictEqual(report.successCount, 1);
    assert.strictEqual(report.failedCount, 0);
  });

  test('should return correct timing and remote metadata in batch report', async () => {
    const report = await engine.syncBranches(['branch-a', 'branch-b'], cwd, 'main', {
      remote: 'upstream',
      dryRun: true
    });

    assert.strictEqual(report.remote, 'upstream');
    assert.strictEqual(report.results.length, 2);
    assert.ok(report.totalDurationMs >= 0);
    assert.ok(report.timestamp instanceof Date);
  });
});
