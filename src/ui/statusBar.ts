import * as vscode from 'vscode';
import { ConfigurationService } from '../config/configurationService';

export class StatusBarManager implements vscode.Disposable {
  private statusBarItem?: vscode.StatusBarItem;

  constructor(private readonly configService: ConfigurationService) {}

  public init(context: vscode.ExtensionContext): void {
    if (!this.configService.showStatusBar) {
      return;
    }

    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      10
    );
    this.statusBarItem.command = 'gitSmartSync.sync';
    this.statusBarItem.text = '$(sync) Sync Branches';
    this.statusBarItem.tooltip = 'Git Smart Sync: Select branches to push and sync';
    this.statusBarItem.show();

    context.subscriptions.push(this.statusBarItem);
  }

  public update(currentBranch?: string): void {
    if (!this.statusBarItem) return;
    if (currentBranch) {
      this.statusBarItem.text = `$(sync) Sync [${currentBranch}]`;
    } else {
      this.statusBarItem.text = '$(sync) Sync Branches';
    }
  }

  public dispose(): void {
    this.statusBarItem?.dispose();
  }
}
