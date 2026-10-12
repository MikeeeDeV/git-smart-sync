import * as vscode from 'vscode';
import { RepositoryService } from '../git/repositoryService';
import { BranchService } from '../git/branchService';
import { ConfigurationService } from '../config/configurationService';
import { QuickPickService } from '../ui/quickPick';
import { OutputChannelLogger } from '../ui/outputChannel';

export class AddPresetCommand {
  constructor(
    private readonly repoService: RepositoryService,
    private readonly branchService: BranchService,
    private readonly configService: ConfigurationService,
    private readonly quickPick: QuickPickService,
    private readonly logger?: OutputChannelLogger
  ) {}

  public async execute(): Promise<void> {
    const presetName = await vscode.window.showInputBox({
      title: 'Create Branch Preset',
      prompt: 'Enter preset group name (e.g. release, staging, feature-rollout)',
      validateInput: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Preset name cannot be empty.';
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(value.trim())) {
          return 'Preset name should contain only alphanumeric characters, dashes, or underscores.';
        }
        return null;
      }
    });

    if (!presetName) {
      return;
    }

    const trimmedName = presetName.trim();
    const repo = await this.repoService.getActiveRepository();
    if (!repo) {
      return;
    }

    const branches = await this.branchService.getAllBranches(
      repo.rootPath,
      this.configService.defaultRemote,
      repo.currentBranch
    );

    if (branches.length === 0) {
      vscode.window.showWarningMessage('No branches found to add to preset.');
      return;
    }

    const selectedBranches = await this.quickPick.promptBranchSelection(branches, repo.currentBranch);
    if (!selectedBranches || selectedBranches.length === 0) {
      vscode.window.showInformationMessage('No branches selected. Preset creation cancelled.');
      return;
    }

    await this.configService.addPreset(trimmedName, selectedBranches);
    this.logger?.info(`Added preset '${trimmedName}' with branches: [${selectedBranches.join(', ')}]`);
    vscode.window.showInformationMessage(`Preset '${trimmedName}' created with ${selectedBranches.length} branches.`);
  }
}
