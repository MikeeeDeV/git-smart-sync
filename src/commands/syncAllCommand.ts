import * as vscode from 'vscode';
import { RepositoryService } from '../git/repositoryService';
import { BranchService } from '../git/branchService';
import { SyncCommand } from './syncCommand';

export class SyncAllCommand {
  constructor(
    private readonly repoService: RepositoryService,
    private readonly branchService: BranchService,
    private readonly syncCommand: SyncCommand
  ) {}

  public async execute(): Promise<void> {
    const repo = await this.repoService.getActiveRepository();
    if (!repo) {
      return;
    }

    const localBranches = await this.branchService.getLocalBranches(repo.rootPath, repo.currentBranch);
    if (localBranches.length === 0) {
      vscode.window.showWarningMessage('No local branches detected to sync.');
      return;
    }

    const branchNames = localBranches.map(b => b.name);
    await this.syncCommand.execute(branchNames);
  }
}
