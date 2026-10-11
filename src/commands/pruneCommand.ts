import * as vscode from 'vscode';
import { RepositoryService } from '../git/repositoryService';
import { BranchService } from '../git/branchService';
import { ConfigurationService } from '../config/configurationService';

export class PruneCommand {
  constructor(
    private readonly repoService: RepositoryService,
    private readonly branchService: BranchService,
    private readonly configService: ConfigurationService
  ) {}

  public async execute(): Promise<void> {
    const repo = await this.repoService.getActiveRepository();
    if (!repo) {
      return;
    }

    const remote = this.configService.defaultRemote;
    const confirm = await vscode.window.showWarningMessage(
      `Prune deleted remote tracking branches for remote '${remote}'?`,
      { modal: true },
      'Prune Remote'
    );

    if (confirm !== 'Prune Remote') {
      return;
    }

    try {
      const output = await this.branchService.pruneRemote(remote, repo.rootPath);
      vscode.window.showInformationMessage(
        output ? `Prune completed:\n${output}` : `Pruned remote tracking branches for '${remote}'.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      vscode.window.showErrorMessage(`Failed to prune remote: ${msg}`);
    }
  }
}
