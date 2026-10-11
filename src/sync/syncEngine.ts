import * as vscode from 'vscode';
import { GitRunner } from '../git/gitRunner';
import { BranchService } from '../git/branchService';
import { SyncOptions, SyncBatchReport, SyncBranchResult } from '../types';

export class SyncEngine {
  constructor(
    private readonly runner: GitRunner,
    private readonly branchService: BranchService
  ) {}

  /**
   * Execute synchronization for a list of branches against target remote.
   */
  public async syncBranches(
    branches: string[],
    cwd: string,
    currentBranch: string,
    options: SyncOptions,
    progress?: vscode.Progress<{ message?: string; increment?: number }>,
    token?: vscode.CancellationToken
  ): Promise<SyncBatchReport> {
    const startTime = Date.now();
    const results: SyncBranchResult[] = [];
    const stepIncrement = branches.length > 0 ? 100 / branches.length : 100;

    for (const branch of branches) {
      if (token?.isCancellationRequested) {
        results.push({
          branch,
          status: 'skipped',
          message: 'Operation cancelled by user'
        });
        continue;
      }

      progress?.report({
        message: `Syncing [${branch}]...`,
        increment: stepIncrement
      });

      const branchStart = Date.now();

      try {
        if (options.dryRun) {
          results.push({
            branch,
            status: 'success',
            message: `[Dry Run] Would push HEAD to ${options.remote}/${branch}`,
            durationMs: Date.now() - branchStart
          });
          continue;
        }

        if (branch === currentBranch) {
          // If pullBeforePush is requested, pull first
          if (options.pullBeforePush) {
            await this.runner.execute(['pull', options.remote, branch], cwd, token);
          }
          await this.runner.execute(['push', options.remote, branch], cwd, token);
        } else {
          // Check if local branch exists
          let localExists = false;
          try {
            await this.runner.execute(['rev-parse', '--verify', `refs/heads/${branch}`], cwd, token);
            localExists = true;
          } catch {
            localExists = false;
          }

          if (localExists) {
            // Verify if safe fast-forward is possible
            const canFf = await this.branchService.canFastForward(branch, 'HEAD', cwd);
            if (!canFf && options.strategy !== 'force-with-lease') {
              results.push({
                branch,
                status: 'failed',
                message: 'Branch has diverged and cannot be fast-forwarded safely',
                durationMs: Date.now() - branchStart
              });
              continue;
            }

            // Safely advance local branch pointer to HEAD
            await this.runner.execute(['branch', '-f', branch, 'HEAD'], cwd, token);
          }

          // Push refspec to remote
          const pushArgs = ['push', options.remote];
          if (options.strategy === 'force-with-lease') {
            pushArgs.push('--force-with-lease');
          }
          pushArgs.push(`HEAD:refs/heads/${branch}`);

          await this.runner.execute(pushArgs, cwd, token);
        }

        results.push({
          branch,
          status: 'success',
          message: `Successfully pushed to ${options.remote}/${branch}`,
          durationMs: Date.now() - branchStart
        });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        results.push({
          branch,
          status: 'failed',
          message: errorMsg,
          durationMs: Date.now() - branchStart
        });
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const failedCount = results.filter(r => r.status === 'failed').length;
    const skippedCount = results.filter(r => r.status === 'skipped').length;

    return {
      timestamp: new Date(),
      remote: options.remote,
      results,
      successCount,
      failedCount,
      skippedCount,
      totalDurationMs: Date.now() - startTime
    };
  }
}
