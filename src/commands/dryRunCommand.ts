import * as vscode from 'vscode';
import { RepositoryService } from '../git/repositoryService';
import { BranchService } from '../git/branchService';
import { SyncEngine } from '../sync/syncEngine';
import { QuickPickService } from '../ui/quickPick';
import { ConfigurationService } from '../config/configurationService';

export class DryRunCommand {
  constructor(
    private readonly repoService: RepositoryService,
    private readonly branchService: BranchService,
    private readonly syncEngine: SyncEngine,
    private readonly quickPick: QuickPickService,
    private readonly configService: ConfigurationService
  ) {}

  public async execute(): Promise<void> {
    const repo = await this.repoService.getActiveRepository();
    if (!repo) {
      return;
    }

    const defaultRemote = this.configService.defaultRemote;
    const allBranches = await this.branchService.getAllBranches(
      repo.rootPath,
      defaultRemote,
      repo.currentBranch
    );

    const targetBranches = await this.quickPick.promptBranchSelection(allBranches, repo.currentBranch);
    if (!targetBranches || targetBranches.length === 0) {
      return;
    }

    const options = {
      remote: defaultRemote,
      strategy: this.configService.syncStrategy,
      dryRun: true
    };

    const report = await this.syncEngine.syncBranches(
      targetBranches,
      repo.rootPath,
      repo.currentBranch,
      options
    );

    const summaryLines = report.results.map(r => `• ${r.branch}: ${r.message}`);
    vscode.window.showInformationMessage(
      `[Dry-Run Preview] Checked ${report.results.length} branches:\n${summaryLines.join('\n')}`,
      { modal: true }
    );
  }
}
