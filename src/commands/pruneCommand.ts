import * as vscode from 'vscode';
import { RepositoryService } from '../git/repositoryService';
import { BranchService } from '../git/branchService';
import { ConfigurationService } from '../config/configurationService';
import { OutputChannelLogger } from '../ui/outputChannel';

export class PruneCommand {
  constructor(
    private readonly repoService: RepositoryService,
    private readonly branchService: BranchService,
    private readonly configService: ConfigurationService,
    private readonly logger?: OutputChannelLogger
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
      this.logger?.info(`Pruning stale remote references for remote '${remote}' in ${repo.rootPath}`);
      const output = await this.branchService.pruneRemote(remote, repo.rootPath);
      this.logger?.info(output ? `Prune output: ${output}` : `Pruned remote tracking branches for '${remote}'.`);
      vscode.window.showInformationMessage(
        output ? `Prune completed:\n${output}` : `Pruned remote tracking branches for '${remote}'.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger?.error(`Prune failed: ${msg}`, err);
      const action = await vscode.window.showErrorMessage(`Failed to prune remote: ${msg}`, 'Show Output');
      if (action === 'Show Output') {
        this.logger?.show();
      }
    }
  }
}
