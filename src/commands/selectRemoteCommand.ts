import * as vscode from 'vscode';
import { RepositoryService } from '../git/repositoryService';
import { ConfigurationService } from '../config/configurationService';
import { OutputChannelLogger } from '../ui/outputChannel';

export class SelectRemoteCommand {
  constructor(
    private readonly repoService: RepositoryService,
    private readonly configService: ConfigurationService,
    private readonly logger?: OutputChannelLogger
  ) {}

  public async execute(): Promise<void> {
    const repo = await this.repoService.getActiveRepository();
    if (!repo) {
      return;
    }

    const remotes = await this.repoService.getRemotes(repo.rootPath);
    if (remotes.length === 0) {
      vscode.window.showWarningMessage('No Git remotes configured for this repository.');
      return;
    }

    const currentDefault = this.configService.defaultRemote;
    const picks = remotes.map(r => ({
      label: r,
      description: r === currentDefault ? '(Current Default)' : '',
      picked: r === currentDefault
    }));

    const selected = await vscode.window.showQuickPick(picks, {
      placeHolder: 'Select default Git remote:'
    });

    if (!selected) {
      return;
    }

    await this.configService.setDefaultRemote(selected.label);
    this.logger?.info(`Updated default remote to '${selected.label}'`);
    vscode.window.showInformationMessage(`Default remote set to '${selected.label}'.`);
  }
}
