const { test, describe } = require('node:test');
const assert = require('node:assert');
const { GitRunner } = require('../dist/git/gitRunner');
const { BranchService } = require('../dist/git/branchService');

describe('BranchService', () => {
  const runner = new GitRunner();
  const service = new BranchService(runner);
  const cwd = process.cwd();

  test('should retrieve local branches including current branch', async () => {
    const branches = await service.getLocalBranches(cwd, 'main');
    assert.ok(Array.isArray(branches));
    assert.ok(branches.length > 0);
    const mainBranch = branches.find(b => b.name === 'main');
    assert.ok(mainBranch, 'Should find main branch');
    assert.strictEqual(mainBranch.isRemote, false);
  });

  test('should confirm HEAD is an ancestor of HEAD (fast-forward valid)', async () => {
    const canFf = await service.canFastForward('HEAD', 'HEAD', cwd);
    assert.strictEqual(canFf, true);
  });

  test('should calculate divergence between identical refs as 0 ahead and 0 behind', async () => {
    const div = await service.getDivergenceCounts('HEAD', 'HEAD', cwd);
    assert.strictEqual(div.ahead, 0);
    assert.strictEqual(div.behind, 0);
  });

  test('should return combined deduplicated branch list', async () => {
    const all = await service.getAllBranches(cwd, 'origin', 'main');
    assert.ok(all.length >= 1);
    const names = all.map(b => b.name);
    const uniqueNames = new Set(names);
    assert.strictEqual(names.length, uniqueNames.size, 'Branch list must have no duplicates');
  });
});
