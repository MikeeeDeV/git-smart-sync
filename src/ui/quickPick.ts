import * as vscode from 'vscode';
import { BranchInfo } from '../types';

export interface BranchQuickPickItem extends vscode.QuickPickItem {
  branchName: string;
}

export class QuickPickService {
  /**
   * Display interactive multi-branch QuickPick with checkboxes and branch status details.
   */
  public async promptBranchSelection(
    branches: BranchInfo[],
    currentBranch: string
  ): Promise<string[] | undefined> {
    const items: BranchQuickPickItem[] = branches.map(b => {
      const isCurrent = b.name === currentBranch;
      const icon = isCurrent ? '$(star-full) ' : b.isRemote ? '$(cloud) ' : '$(git-branch) ';
      const description = isCurrent ? '(Current active branch)' : b.isRemote ? '(Remote branch)' : '';
      const detail = b.lastCommitSubject ? `Latest: ${b.lastCommitSubject}` : undefined;

      return {
        label: `${icon}${b.name}`,
        branchName: b.name,
        description,
        detail,
        picked: true // Pre-checked by default
      };
    });

    const selected = await vscode.window.showQuickPick(items, {
      canPickMany: true,
      matchOnDescription: true,
      matchOnDetail: true,
      placeHolder: 'Select branches to synchronize and push changes to:'
    });

    if (!selected || selected.length === 0) {
      return undefined;
    }

    return selected.map(s => s.branchName);
  }

  /**
   * Prompt user to select a branch preset.
   */
  public async promptPresetSelection(
    presets: { id: string; name: string; branches: string[] }[]
  ): Promise<{ id: string; name: string; branches: string[] } | undefined> {
    const items = presets.map(p => ({
      label: `$(layers) ${p.name}`,
      description: `[${p.branches.join(', ')}]`,
      preset: p
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select branch preset to synchronize:'
    });

    return selected?.preset;
  }
}
