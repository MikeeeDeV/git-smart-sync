import * as vscode from 'vscode';
import { RepositoryService } from '../git/repositoryService';
import { BranchService } from '../git/branchService';
import { SyncEngine } from '../sync/syncEngine';
import { QuickPickService } from '../ui/quickPick';
import { ConfigurationService } from '../config/configurationService';

export class SyncCommand {
  constructor(
    private readonly repoService: RepositoryService,
    private readonly branchService: BranchService,
    private readonly syncEngine: SyncEngine,
    private readonly quickPick: QuickPickService,
    private readonly configService: ConfigurationService
  ) {}

  public async execute(branchesToSync?: string[]): Promise<void> {
    const repo = await this.repoService.getActiveRepository();
    if (!repo) {
      return;
    }

    const defaultRemote = this.configService.defaultRemote;
    let targetBranches = branchesToSync;

    if (!targetBranches || targetBranches.length === 0) {
      const allBranches = await this.branchService.getAllBranches(
        repo.rootPath,
        defaultRemote,
        repo.currentBranch
      );

      if (allBranches.length === 0) {
        vscode.window.showWarningMessage('No local or remote branches found in this repository.');
        return;
      }

      targetBranches = await this.quickPick.promptBranchSelection(allBranches, repo.currentBranch);
      if (!targetBranches || targetBranches.length === 0) {
        vscode.window.showInformationMessage('Branch synchronization cancelled.');
        return;
      }
    }

    const options = {
      remote: defaultRemote,
      strategy: this.configService.syncStrategy,
      pullBeforePush: this.configService.autoPullBeforePush
    };

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Syncing ${targetBranches.length} branches to remote '${defaultRemote}'...`,
        cancellable: true
      },
      async (progress, token) => {
        const report = await this.syncEngine.syncBranches(
          targetBranches!,
          repo.rootPath,
          repo.currentBranch,
          options,
          progress,
          token
        );

        if (report.failedCount > 0) {
          const failedDetails = report.results
            .filter(r => r.status === 'failed')
            .map(r => `${r.branch}: ${r.message}`)
            .join(' | ');

          vscode.window.showWarningMessage(
            `Sync finished with errors. Success: ${report.successCount}, Failed: ${report.failedCount}. [${failedDetails}]`
          );
        } else {
          vscode.window.showInformationMessage(
            `Successfully synced ${report.successCount} branches in ${(report.totalDurationMs / 1000).toFixed(1)}s.`
          );
        }
      }
    );
  }
}
