import * as vscode from 'vscode';
import { ConfigurationService } from '../config/configurationService';
import { QuickPickService } from '../ui/quickPick';
import { SyncCommand } from './syncCommand';

export class SyncPresetCommand {
  constructor(
    private readonly configService: ConfigurationService,
    private readonly quickPick: QuickPickService,
    private readonly syncCommand: SyncCommand
  ) {}

  public async execute(presetBranches?: string[]): Promise<void> {
    if (presetBranches && presetBranches.length > 0) {
      await this.syncCommand.execute(presetBranches);
      return;
    }

    const presets = this.configService.getPresets();
    if (presets.length === 0) {
      vscode.window.showInformationMessage('No branch presets configured. Configure them in Settings -> Git Smart Sync: Presets.');
      return;
    }

    const selected = await this.quickPick.promptPresetSelection(presets);
    if (!selected) {
      return;
    }

    await this.syncCommand.execute(selected.branches);
  }
}
