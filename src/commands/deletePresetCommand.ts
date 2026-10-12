import * as vscode from 'vscode';
import { ConfigurationService } from '../config/configurationService';
import { BranchTreeItem } from '../ui/branchTreeProvider';
import { OutputChannelLogger } from '../ui/outputChannel';

export class DeletePresetCommand {
  constructor(
    private readonly configService: ConfigurationService,
    private readonly logger?: OutputChannelLogger
  ) {}

  public async execute(item?: BranchTreeItem): Promise<void> {
    let presetId = item?.presetId;

    if (!presetId) {
      const presets = this.configService.getPresets();
      if (presets.length === 0) {
        vscode.window.showInformationMessage('No branch presets configured to delete.');
        return;
      }

      const pick = await vscode.window.showQuickPick(
        presets.map(p => ({
          label: p.name,
          description: `[${p.branches.join(', ')}]`,
          id: p.id
        })),
        { placeHolder: 'Select preset group to delete:' }
      );

      if (!pick) {
        return;
      }
      presetId = pick.id;
    }

    const confirm = await vscode.window.showWarningMessage(
      `Delete preset '${presetId}'?`,
      { modal: true },
      'Delete'
    );

    if (confirm !== 'Delete') {
      return;
    }

    await this.configService.deletePreset(presetId);
    this.logger?.info(`Deleted preset '${presetId}'`);
    vscode.window.showInformationMessage(`Preset '${presetId}' has been deleted.`);
  }
}
